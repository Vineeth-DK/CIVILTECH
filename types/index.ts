export type Role = 'admin' | 'sales' | 'survey' | 'mapping' | 'drawing' | 'visualization' | 'accounts';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'bypassed' | 'cancelled' | 'waiting' | 'cancellation_requested';

export type StatusFilter = 'all' | 'in_progress' | 'completed' | 'bypassed' | 'cancelled';

export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ProjectType = string; // Allows predefined types + custom "Other" entries

export type PipelineStage = 'sales' | 'survey' | 'mapping' | 'drawing' | 'visualization' | 'accounts';

/**
 * Determines the entire workflow pipeline for a project.
 * - marking:       Sales → Survey + Mapping (simultaneous) → Accounts
 * - mapping:       Sales → Survey → Mapping → Accounts
 * - drawing:       Sales → Drawing → Accounts
 * - visualization: Sales → 3D Visualization → Accounts
 */
export type WorkflowType = 'marking' | 'mapping' | 'drawing' | 'visualization' | 'survey_only' | 'survey_mapping';

export interface StageRecord {
  status: StageStatus;
  completedAt?: string;
  reachedAt?: string;       // Survey: when field team confirmed site arrival
  scheduledDate?: string;   // Survey / Mapping: specific field-visit date (not a deadline)
  notes?: string;
  assignedTo?: string;
  cancelReason?: string;    // Required if status === 'cancelled'
}

export interface LeadDetails {
  clientPhone: string;
}

/** Fields required when creating a new lead */
export interface NewLead {
  name: string;
  client: string;
  clientPhone: string;
  location: string;
  type: string;
  workflowType: WorkflowType;  // determines pipeline
  value?: number;              // project amount — visible to admin/sales/accounts only
  scheduledDate?: string;      // for marking/mapping workflows (field visit date)
  deadline?: string;           // for drawing/visualization workflows
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  clientPhone?: string;
  location: string;
  type: string;
  workflowType: WorkflowType;
  priority: Priority;
  value: number;              // admin/sales/accounts only
  currentStage: PipelineStage;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;     // survey/mapping field-visit date
  deadline?: string;          // drawing/viz/accounts deadline
  stages: {
    sales:         StageRecord;
    survey:        StageRecord;
    mapping:       StageRecord;
    drawing:       StageRecord;
    visualization: StageRecord;
    accounts:      StageRecord;
  };
  description: string;
  area?: number;
  mapsLink?: string;
}

export interface User {
  role: Role;
  name: string;
}

export interface ProjectStore {
  projects: Project[];
  currentUser: User | null;
  isDarkMode: boolean;
  isInitializing: boolean;

  initProjects: () => Promise<void>;

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
  confirmLead: (projectId: string, details: LeadDetails) => void;
  markReachedLocation: (projectId: string) => void;

  // Survey completions (workflow-aware)
  completeSurvey: (projectId: string) => void;
  completeMapping: (projectId: string) => void;
  completeDrawing: (projectId: string) => void;
  completeVisualization: (projectId: string) => void;
  completeAccounts: (projectId: string) => void;

  // Cancel / reschedule / revert / delete
  requestCancellation: (projectId: string, stage: PipelineStage, reason: string) => void;
  approveCancellation: (projectId: string, stage: PipelineStage) => void;
  reassignProject: (projectId: string, fromStage: PipelineStage, toStage: PipelineStage, newDate?: string) => void;
  revertProject: (projectId: string, fromStage: PipelineStage, reason: string) => void;
  deleteProject: (projectId: string) => void;
  cancelStage: (projectId: string, stage: PipelineStage, reason: string) => void;
  rescheduleStage: (projectId: string, stage: PipelineStage, newDate?: string) => void;

  // Selectors
  getProjectsByStage: (stage: PipelineStage) => Project[];
  getProjectsByDeptStatus: (stage: PipelineStage, filter: 'all' | StageStatus) => Project[];
  getAllProjects: () => Project[];
}
