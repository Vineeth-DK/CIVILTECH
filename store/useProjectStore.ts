'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Project, Role, User, PipelineStage, ProjectStore,
  StageStatus, StatusFilter, DateFilter, LeadDetails, NewLead, WorkflowType,
} from '@/types';
import { CREDENTIALS } from '@/lib/auth';
import { fetchProjectsDB, upsertProjectDB, deleteProjectDB, subscribeProjectsDB } from '@/lib/supabaseSync';

const now = () => new Date().toISOString();
const bypassed = (): { status: 'bypassed'; completedAt: string } => ({ status: 'bypassed', completedAt: now() });

/** Build initial stage records for a new lead based on workflow type */
function buildInitialStages(wf: WorkflowType, assignedTo: string, scheduledDate?: string, deadline?: string) {
  const pending = { status: 'pending' as StageStatus };
  const sales   = { status: 'in_progress' as StageStatus, assignedTo };

  switch (wf) {
    case 'marking':
      // Survey + Mapping notified simultaneously after sales confirmation
      return {
        sales,
        survey:        pending,
        mapping:       pending,
        drawing:       bypassed(),
        visualization: bypassed(),
        qs_boq:        bypassed(),
        accounts:      pending,
      };

    case 'survey':
    case 'mapping':
      // Survey first → Mapping (if required) → Accounts
      return {
        sales,
        survey:        pending,
        mapping:       pending,
        drawing:       bypassed(),
        visualization: bypassed(),
        qs_boq:        bypassed(),
        accounts:      pending,
      };

    case 'drawing':
      // Sales → Drawing → Accounts
      return {
        sales,
        survey:        bypassed(),
        mapping:       bypassed(),
        drawing:       pending,
        visualization: bypassed(),
        qs_boq:        bypassed(),
        accounts:      pending,
      };

    case 'visualization':
      // Sales → 3D Visualization → Accounts
      return {
        sales,
        survey:        bypassed(),
        mapping:       bypassed(),
        drawing:       bypassed(),
        visualization: pending,
        qs_boq:        bypassed(),
        accounts:      pending,
      };

    case 'qs_boq':
      return {
        sales,
        survey:        bypassed(),
        mapping:       bypassed(),
        drawing:       bypassed(),
        visualization: bypassed(),
        qs_boq:        pending,
        accounts:      pending,
      };
  }
}

let currentUnsubscribe: (() => void) | null = null;

export const useProjectStore = create<ProjectStore>()(
  (set, get) => ({
    projects: [],
    currentUser: null,
    isDarkMode: false,
    isInitializing: true,
    isSyncing: false,

    initProjects: async () => {
      set({ isInitializing: true });
      const projects = await fetchProjectsDB();
      set({ projects, isInitializing: false });

      if (currentUnsubscribe) currentUnsubscribe();

      // Subscribe to real-time changes
      currentUnsubscribe = subscribeProjectsDB(async () => {
        // Refetch all projects on any change
        const latestProjects = await fetchProjectsDB();
        set({ isSyncing: true, projects: latestProjects });
        setTimeout(() => set({ isSyncing: false }), 0);
      });
    },

    currentFilter: 'all' as StatusFilter,
    searchQuery: '',
    dateFilter: 'all' as DateFilter,

      // ── Auth ──────────────────────────────────────────────────────────────

      loginWithCredentials: (username: string, password: string): boolean => {
        const key  = username.trim().toLowerCase();
        const cred = CREDENTIALS[key];
        if (!cred || cred.password !== password) return false;
        set({ currentUser: { role: cred.role, name: cred.name }, currentFilter: 'all', searchQuery: '', dateFilter: 'all' });
        return true;
      },

      logout: () => set({ currentUser: null, currentFilter: 'all', searchQuery: '', dateFilter: 'all' }),

      toggleDarkMode: () => {
        const next = !get().isDarkMode;
        set({ isDarkMode: next });
        if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', next);
      },

      // ── Filters ───────────────────────────────────────────────────────────

      setCurrentFilter: (filter: StatusFilter) => set({ currentFilter: filter }),
      setSearchQuery:   (query: string)         => set({ searchQuery: query }),
      setDateFilter:    (filter: DateFilter)     => set({ dateFilter: filter }),

      // ── Lead management ───────────────────────────────────────────────────

      addLead: (lead: NewLead) => {
        const projects = get().projects;
        const id  = `PRJ-${String(projects.length + 1).padStart(3, '0')}`;
        const user = get().currentUser;
        const newProject: Project = {
          id,
          name:         lead.name,
          client:       lead.client,
          clientPhone:  lead.clientPhone,
          location:     lead.location,
          type:         lead.type,
          workflowType: lead.workflowType,
          priority:     'medium',
          value:        lead.value ?? 0,
          scheduledDate: lead.scheduledDate,
          deadline:     lead.deadline,
          description:  lead.description ?? '',
          currentStage: 'sales',
          createdAt:    now(),
          updatedAt:    now(),
          stages:       buildInitialStages(lead.workflowType, user?.name ?? 'Admin', lead.scheduledDate, lead.deadline) as Project['stages'],
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      requestEdit: (projectId: string, updates: Partial<Project>, requestedBy: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              editRequest: { requestedBy, requestedAt: now(), updates },
              updatedAt: now(),
            };
          }),
        }));
      },

      approveEdit: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId || !p.editRequest) return p;
            const newProj = { ...p, ...p.editRequest.updates };
            delete newProj.editRequest;
            return { ...newProj, updatedAt: now() };
          }),
        }));
      },

      rejectEdit: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId || !p.editRequest) return p;
            const newProj = { ...p };
            delete newProj.editRequest;
            return { ...newProj, updatedAt: now() };
          }),
        }));
      },

      editLead: (projectId: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const newProj = { ...p, ...updates };
            delete newProj.editRequest; // direct edit clears any pending
            return { ...newProj, updatedAt: now() };
          }),
        }));
      },

      // ── confirmLead — Sales confirms lead, routes based on workflow ────────

      confirmLead: (projectId: string, details: LeadDetails) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const wf = p.workflowType;
            const base = {
              ...p,
              clientPhone: details.clientPhone,
              updatedAt: now(),
              stages: {
                ...p.stages,
                sales: { ...p.stages.sales, status: 'completed' as StageStatus, completedAt: now() },
              },
            };

            if (wf === 'marking') {
              // Notify Survey + Mapping simultaneously
              return {
                ...base,
                currentStage: 'survey' as PipelineStage,
                stages: {
                  ...base.stages,
                  survey:  { ...p.stages.survey,  status: 'in_progress' as StageStatus, scheduledDate: p.scheduledDate },
                  mapping: { ...p.stages.mapping, status: 'in_progress' as StageStatus, scheduledDate: p.scheduledDate },
                },
              };
            }

            if (wf === 'mapping' || wf === 'survey') {
              return {
                ...base,
                currentStage: 'survey' as PipelineStage,
                stages: { ...base.stages, survey: { ...p.stages.survey, status: 'in_progress' as StageStatus, scheduledDate: p.scheduledDate } },
              };
            }

            if (wf === 'drawing') {
              return {
                ...base,
                currentStage: 'drawing' as PipelineStage,
                stages: { ...base.stages, drawing: { ...p.stages.drawing, status: 'in_progress' as StageStatus } },
              };
            }

            if (wf === 'visualization') {
              return {
                ...base,
                currentStage: 'visualization' as PipelineStage,
                stages: { ...base.stages, visualization: { ...p.stages.visualization, status: 'in_progress' as StageStatus } },
              };
            }

            if (wf === 'qs_boq') {
              return {
                ...base,
                currentStage: 'qs_boq' as PipelineStage,
                stages: { ...base.stages, qs_boq: { ...p.stages.qs_boq, status: 'in_progress' as StageStatus } },
              };
            }

            return base;
          }),
        }));
      },

      // ── Survey reach ──────────────────────────────────────────────────────

      markReachedLocation: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              updatedAt: now(),
              stages: { ...p.stages, survey: { ...p.stages.survey, reachedAt: now(), notes: 'Field team confirmed site arrival.' } },
            };
          }),
        }));
      },

      // ── completeSurvey — workflow-aware ────────────────────────────────────

      completeSurvey: (projectId: string, mappingRequired: boolean) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedSurvey = { ...p.stages.survey, status: 'completed' as StageStatus, completedAt: now(), notes: 'Survey complete.' };

            if (mappingRequired) {
              return {
                ...p,
                currentStage: 'mapping' as PipelineStage,
                updatedAt: now(),
                stages: {
                  ...p.stages,
                  survey: updatedSurvey,
                  mapping: { ...p.stages.mapping, status: 'in_progress' as StageStatus, scheduledDate: p.scheduledDate },
                },
              };
            } else {
              return {
                ...p,
                currentStage: 'accounts' as PipelineStage,
                updatedAt: now(),
                stages: {
                  ...p.stages,
                  survey: updatedSurvey,
                  mapping: { ...p.stages.mapping, status: 'bypassed' as StageStatus, completedAt: now() },
                  accounts: { ...p.stages.accounts, status: 'in_progress' as StageStatus },
                },
              };
            }
          }),
        }));
      },

      // ── completeMapping — workflow-aware ────────────────────────────────────

      completeMapping: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedMapping = { ...p.stages.mapping, status: 'completed' as StageStatus, completedAt: now(), notes: 'Mapping complete.' };
            const wf = p.workflowType;

            if (wf === 'marking') {
              const surveyDone = p.stages.survey.status === 'completed';
              if (surveyDone) {
                return { ...p, currentStage: 'accounts' as PipelineStage, updatedAt: now(),
                  stages: { ...p.stages, mapping: updatedMapping, accounts: { ...p.stages.accounts, status: 'in_progress' as StageStatus } } };
              }
              return { ...p, updatedAt: now(), stages: { ...p.stages, mapping: updatedMapping } };
            }

            // mapping workflow: mapping → accounts
            if (wf === 'mapping' || wf === 'survey') {
              return { ...p, currentStage: 'accounts' as PipelineStage, updatedAt: now(),
                stages: { ...p.stages, mapping: updatedMapping, accounts: { ...p.stages.accounts, status: 'in_progress' as StageStatus } } };
            }

            return { ...p, updatedAt: now(), stages: { ...p.stages, mapping: updatedMapping } };
          }),
        }));
      },

      completeDrawing: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, currentStage: 'accounts' as PipelineStage, updatedAt: now(),
              stages: { ...p.stages,
                drawing:  { ...p.stages.drawing,  status: 'completed' as StageStatus, completedAt: now(), notes: 'Drawings finalised.' },
                accounts: { ...p.stages.accounts, status: 'in_progress' as StageStatus } } };
          }),
        }));
      },

      completeVisualization: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, currentStage: 'accounts' as PipelineStage, updatedAt: now(),
              stages: { ...p.stages,
                visualization: { ...p.stages.visualization, status: 'completed' as StageStatus, completedAt: now(), notes: '3D models delivered.' },
                accounts:      { ...p.stages.accounts,      status: 'in_progress' as StageStatus } } };
          }),
        }));
      },

      completeQsBoq: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, currentStage: 'accounts' as PipelineStage, updatedAt: now(),
              stages: { ...p.stages,
                qs_boq:   { ...p.stages.qs_boq,   status: 'completed' as StageStatus, completedAt: now(), notes: 'QS/BOQ finalised.' },
                accounts: { ...p.stages.accounts, status: 'in_progress' as StageStatus } } };
          }),
        }));
      },

      completeAccounts: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, updatedAt: now(),
              stages: { ...p.stages, accounts: { ...p.stages.accounts, status: 'completed' as StageStatus, completedAt: now(), notes: 'Project invoiced and closed.' } } };
          }),
        }));
      },

      // ── Cancel / Reschedule ───────────────────────────────────────────────

      /** Worker submits a cancellation request — admin must approve or reassign */
      requestCancellation: (projectId: string, stage: PipelineStage, reason: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, updatedAt: now(),
              stages: { ...p.stages, [stage]: {
                ...p.stages[stage],
                status: 'cancellation_requested' as StageStatus,
                cancelReason: reason,
              } } };
          }),
        }));
      },

      /** Admin approves the cancellation request → marks as cancelled */
      approveCancellation: (projectId: string, stage: PipelineStage) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, updatedAt: now(),
              stages: { ...p.stages, [stage]: { ...p.stages[stage], status: 'cancelled' as StageStatus } } };
          }),
        }));
      },

      /** Admin re-assigns the project to a different stage (correcting a mistake) */
      reassignProject: (projectId: string, fromStage: PipelineStage, toStage: PipelineStage, newDate?: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, currentStage: toStage, updatedAt: now(),
              stages: { ...p.stages,
                [fromStage]: { ...p.stages[fromStage], status: 'bypassed' as StageStatus, completedAt: now() },
                [toStage]:   { ...p.stages[toStage],   status: 'in_progress' as StageStatus, cancelReason: undefined,
                  ...(newDate ? { scheduledDate: newDate } : {}),
                },
              } };
          }),
        }));
      },

      /** Worker reverts the project back to the previous completed department due to an issue */
      revertProject: (projectId: string, fromStage: PipelineStage, reason: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const STAGES: PipelineStage[] = ['sales', 'survey', 'mapping', 'drawing', 'visualization', 'accounts'];
            const currentIndex = STAGES.indexOf(fromStage);
            let prevStage: PipelineStage | null = null;
            
            // Find the most recent stage before this one that is 'completed'
            for (let i = currentIndex - 1; i >= 0; i--) {
              if (p.stages[STAGES[i]]?.status === 'completed') {
                prevStage = STAGES[i];
                break;
              }
            }
            if (!prevStage) return p; // Cannot revert if no previous stage

            return {
              ...p,
              currentStage: prevStage,
              updatedAt: now(),
              stages: {
                ...p.stages,
                [fromStage]: { ...p.stages[fromStage], status: 'pending' as StageStatus, cancelReason: undefined },
                [prevStage]: { ...p.stages[prevStage], status: 'in_progress' as StageStatus, notes: `⚠️ Reverted from ${fromStage}. Reason: ${reason}` }
              }
            };
          }),
        }));
      },

      deleteProject: (projectId: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        }));
      },

      /** Legacy direct-cancel kept for admin use */
      cancelStage: (projectId: string, stage: PipelineStage, reason: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, updatedAt: now(),
              stages: { ...p.stages, [stage]: { ...p.stages[stage], status: 'cancelled' as StageStatus, cancelReason: reason } } };
          }),
        }));
      },

      rescheduleStage: (projectId: string, stage: PipelineStage, newDate?: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, updatedAt: now(),
              stages: { ...p.stages, [stage]: {
                ...p.stages[stage],
                status: 'in_progress' as StageStatus,
                cancelReason: undefined,
                ...(newDate ? { scheduledDate: newDate } : {}),
              } } };
          }),
        }));
      },

      // ── Selectors ─────────────────────────────────────────────────────────

      getProjectsByStage: (stage: PipelineStage) => get().projects.filter((p) => p.currentStage === stage),

      getProjectsByDeptStatus: (stage: PipelineStage, filter: 'all' | StageStatus) => {
        const touched = get().projects.filter((p) => p.stages[stage]?.status !== 'pending' && p.stages[stage]?.status !== 'bypassed');
        if (filter === 'all') return touched;
        return touched.filter((p) => p.stages[stage]?.status === filter);
      },

      getAllProjects: () => get().projects,
    })
);

// Subscribe to store changes to push to Supabase
useProjectStore.subscribe((state, prevState) => {
  if (state.isSyncing) return;
  if (state.projects === prevState.projects) return;

  // Find added or modified projects
  state.projects.forEach(p => {
    const prev = prevState.projects.find(old => old.id === p.id);
    if (!prev || prev !== p) {
      upsertProjectDB(p);
    }
  });

  // Find deleted projects
  prevState.projects.forEach(prev => {
    if (!state.projects.find(p => p.id === prev.id)) {
      deleteProjectDB(prev.id);
    }
  });
});
