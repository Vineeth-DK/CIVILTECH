export type Role = 'admin' | 'sales' | 'survey' | 'mapping' | 'drafting' | 'accounts';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'bypassed' | 'waiting';

export type StatusFilter = 'all' | 'in_progress' | 'completed' | 'bypassed';

export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ProjectType =
  | 'Road Construction'
  | 'Bridge Engineering'
  | 'Drainage System'
  | 'Structural Audit'
  | 'Land Survey'
  | 'Residential Layout'
  | 'Commercial Development'
  | 'Water Treatment'
  | 'Highway Expansion'
  | 'Flyover Design';

export type PipelineStage = 'sales' | 'survey' | 'mapping' | 'drafting' | 'accounts';

export interface StageRecord {
  status: StageStatus;
  completedAt?: string;
  reachedAt?: string;   // Survey: timestamp when field team reached site
  notes?: string;
  assignedTo?: string;
}

export interface LeadDetails {
  clientPhone: string;
  mapsLink: string;
}

/** Fields required when creating a new lead (from Add Lead form) */
export interface NewLead {
  name: string;
  client: string;
  clientPhone: string;
  location: string;
  mapsLink?: string;
  type: ProjectType;
  deadline?: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  type: ProjectType;
  priority: Priority;
  value: number;          // in lakhs INR — visible to admin only
  currentStage: PipelineStage;
  createdAt: string;
  updatedAt: string;
  deadline?: string;      // ISO date string
  stages: {
    sales: StageRecord;
    survey: StageRecord;
    mapping: StageRecord;
    drafting: StageRecord;
    accounts: StageRecord;
  };
  description: string;
  area?: number;
  // Lead details added by Sales on confirmation
  clientPhone?: string;
  mapsLink?: string;
}

export interface User {
  role: Role;
  name: string;
}

export interface ProjectStore {
  // Data
  projects: Project[];
  currentUser: User | null;
  isDarkMode: boolean;

  // Filter state (sidebar + topbar)
  currentFilter: StatusFilter;
  searchQuery: string;
  dateFilter: DateFilter;

  // Auth
  loginWithCredentials: (username: string, password: string) => boolean;
  logout: () => void;
  toggleDarkMode: () => void;

  // Filters
  setCurrentFilter: (filter: StatusFilter) => void;
  setSearchQuery: (query: string) => void;
  setDateFilter: (filter: DateFilter) => void;

  // Lead management
  addLead: (lead: NewLead) => void;

  // Pipeline actions
  confirmLead: (projectId: string, surveyRequired: boolean, details: LeadDetails) => void;
  markReachedLocation: (projectId: string) => void;
  completeSurvey: (projectId: string, mappingRequired: boolean) => void;
  completeMapping: (projectId: string) => void;
  completeDrafting: (projectId: string) => void;
  completeAccounts: (projectId: string) => void;

  // Selectors
  getProjectsByStage: (stage: PipelineStage) => Project[];
  getProjectsByDeptStatus: (stage: PipelineStage, filter: 'all' | StageStatus) => Project[];
  getAllProjects: () => Project[];
}
