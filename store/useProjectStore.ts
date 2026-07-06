'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Project, Role, User, PipelineStage, ProjectStore,
  StageStatus, StatusFilter, DateFilter, LeadDetails, NewLead, WorkflowType,
} from '@/types';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { CREDENTIALS } from '@/lib/auth';

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
        accounts:      pending,
      };

    case 'mapping':
      // Survey first → Mapping → Accounts
      return {
        sales,
        survey:        pending,
        mapping:       pending,
        drawing:       bypassed(),
        visualization: bypassed(),
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
        accounts:      pending,
      };
  }
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: MOCK_PROJECTS,
      currentUser: null,
      isDarkMode: true,
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

            if (wf === 'mapping') {
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

      completeSurvey: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedSurvey = { ...p.stages.survey, status: 'completed' as StageStatus, completedAt: now(), notes: 'Survey complete.' };
            const wf = p.workflowType;

            if (wf === 'marking') {
              // Both survey and mapping must complete before → accounts
              const mappingDone = p.stages.mapping.status === 'completed';
              if (mappingDone) {
                return { ...p, currentStage: 'accounts' as PipelineStage, updatedAt: now(),
                  stages: { ...p.stages, survey: updatedSurvey, accounts: { ...p.stages.accounts, status: 'in_progress' as StageStatus } } };
              }
              // Mapping still in progress — wait
              return { ...p, updatedAt: now(), stages: { ...p.stages, survey: updatedSurvey } };
            }

            if (wf === 'mapping') {
              // mapping workflow: survey → mapping
              return { ...p, currentStage: 'mapping' as PipelineStage, updatedAt: now(),
                stages: { ...p.stages, survey: updatedSurvey, mapping: { ...p.stages.mapping, status: 'in_progress' as StageStatus, scheduledDate: p.scheduledDate } } };
            }

            return { ...p, updatedAt: now(), stages: { ...p.stages, survey: updatedSurvey } };
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
            if (wf === 'mapping') {
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
        const touched = get().projects.filter((p) => p.stages[stage].status !== 'pending' && p.stages[stage].status !== 'bypassed');
        if (filter === 'all') return touched;
        return touched.filter((p) => p.stages[stage].status === filter);
      },

      getAllProjects: () => get().projects,
    }),
    {
      name: 'civiltech-store-v5',
      partialize: (state) => ({ projects: state.projects, isDarkMode: state.isDarkMode }),
    },
  ),
);
