'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Project, Role, User, PipelineStage, ProjectStore,
  StageStatus, StatusFilter, DateFilter, LeadDetails, NewLead,
} from '@/types';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { USER_NAMES } from '@/lib/roles';
import { CREDENTIALS } from '@/lib/auth';

const now = () => new Date().toISOString();

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
        const key = username.trim().toLowerCase();
        const cred = CREDENTIALS[key];
        if (!cred || cred.password !== password) return false;
        set({ currentUser: { role: cred.role, name: cred.name }, currentFilter: 'all', searchQuery: '', dateFilter: 'all' });
        return true;
      },

      logout: () => set({ currentUser: null, currentFilter: 'all', searchQuery: '', dateFilter: 'all' }),

      toggleDarkMode: () => {
        const next = !get().isDarkMode;
        set({ isDarkMode: next });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next);
        }
      },

      // ── Filters ───────────────────────────────────────────────────────────

      setCurrentFilter: (filter: StatusFilter) => set({ currentFilter: filter }),
      setSearchQuery:   (query: string)         => set({ searchQuery: query }),
      setDateFilter:    (filter: DateFilter)     => set({ dateFilter: filter }),

      // ── Lead management ───────────────────────────────────────────────────

      addLead: (lead: NewLead) => {
        const projects = get().projects;
        const num = projects.length + 1;
        const id = `PRJ-${String(num).padStart(3, '0')}`;
        const user = get().currentUser;
        const newProject: Project = {
          id,
          name: lead.name,
          client: lead.client,
          clientPhone: lead.clientPhone,
          mapsLink: lead.mapsLink ?? '',
          location: lead.location,
          type: lead.type,
          priority: 'medium',
          value: 0,
          deadline: lead.deadline,
          description: lead.description ?? '',
          currentStage: 'sales',
          createdAt: now(),
          updatedAt: now(),
          stages: {
            sales:    { status: 'in_progress', assignedTo: user?.name ?? 'Admin' },
            survey:   { status: 'pending' },
            mapping:  { status: 'pending' },
            drafting: { status: 'pending' },
            accounts: { status: 'pending' },
          },
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      // ── Pipeline actions ──────────────────────────────────────────────────

      confirmLead: (projectId: string, surveyRequired: boolean, details: LeadDetails) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const base = {
              ...p,
              clientPhone: details.clientPhone,
              mapsLink:    details.mapsLink,
              updatedAt:   now(),
              stages: {
                ...p.stages,
                sales: { ...p.stages.sales, status: 'completed' as StageStatus, completedAt: now(), notes: `Lead confirmed. ${surveyRequired ? 'Survey required.' : 'Survey bypassed.'}` },
              },
            };
            if (!surveyRequired) {
              return { ...base, currentStage: 'mapping' as PipelineStage, stages: { ...base.stages, survey: { ...p.stages.survey, status: 'bypassed' as StageStatus, completedAt: now() }, mapping: { ...p.stages.mapping, status: 'in_progress' as StageStatus } } };
            }
            return { ...base, currentStage: 'survey' as PipelineStage, stages: { ...base.stages, survey: { ...p.stages.survey, status: 'in_progress' as StageStatus } } };
          }),
        }));
      },

      markReachedLocation: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              updatedAt: now(),
              stages: {
                ...p.stages,
                survey: { ...p.stages.survey, reachedAt: now(), notes: 'Field team confirmed site arrival.' },
              },
            };
          }),
        }));
      },

      completeSurvey: (projectId: string, mappingRequired: boolean) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const base = {
              ...p,
              updatedAt: now(),
              stages: {
                ...p.stages,
                survey: { ...p.stages.survey, status: 'completed' as StageStatus, completedAt: now(), notes: `Survey complete. ${mappingRequired ? 'Mapping required.' : 'Mapping & Drafting bypassed.'}` },
              },
            };
            if (!mappingRequired) {
              return { ...base, currentStage: 'accounts' as PipelineStage, stages: { ...base.stages, mapping: { ...p.stages.mapping, status: 'bypassed' as StageStatus, completedAt: now() }, drafting: { ...p.stages.drafting, status: 'bypassed' as StageStatus, completedAt: now() }, accounts: { ...p.stages.accounts, status: 'in_progress' as StageStatus } } };
            }
            return { ...base, currentStage: 'mapping' as PipelineStage, stages: { ...base.stages, mapping: { ...p.stages.mapping, status: 'in_progress' as StageStatus } } };
          }),
        }));
      },

      completeMapping: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, currentStage: 'drafting' as PipelineStage, updatedAt: now(), stages: { ...p.stages, mapping: { ...p.stages.mapping, status: 'completed' as StageStatus, completedAt: now(), notes: 'Mapping complete.' }, drafting: { ...p.stages.drafting, status: 'in_progress' as StageStatus } } };
          }),
        }));
      },

      completeDrafting: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, currentStage: 'accounts' as PipelineStage, updatedAt: now(), stages: { ...p.stages, drafting: { ...p.stages.drafting, status: 'completed' as StageStatus, completedAt: now(), notes: 'Drawings finalised.' }, accounts: { ...p.stages.accounts, status: 'in_progress' as StageStatus } } };
          }),
        }));
      },

      completeAccounts: (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return { ...p, updatedAt: now(), stages: { ...p.stages, accounts: { ...p.stages.accounts, status: 'completed' as StageStatus, completedAt: now(), notes: 'Project invoiced and closed.' } } };
          }),
        }));
      },

      // ── Selectors ─────────────────────────────────────────────────────────

      getProjectsByStage: (stage: PipelineStage) => get().projects.filter((p) => p.currentStage === stage),

      getProjectsByDeptStatus: (stage: PipelineStage, filter: 'all' | StageStatus) => {
        const touched = get().projects.filter((p) => p.stages[stage].status !== 'pending');
        if (filter === 'all') return touched;
        return touched.filter((p) => p.stages[stage].status === filter);
      },

      getAllProjects: () => get().projects,
    }),
    {
      name: 'civiltech-store-v2',
      partialize: (state) => ({ projects: state.projects, isDarkMode: state.isDarkMode }),
    },
  ),
);
