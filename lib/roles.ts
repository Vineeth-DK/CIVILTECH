import { Role, PipelineStage } from '@/types';

export interface RoleConfig {
  role: Role;
  label: string;
  description: string;
  color: string;
  gradient: string;
  icon: string;
  stage?: PipelineStage;
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  admin: {
    role: 'admin',
    label: 'Administrator',
    description: 'Full project oversight across all departments',
    color: 'text-violet-400',
    gradient: 'from-violet-600 to-purple-700',
    icon: 'ShieldCheck',
  },
  sales: {
    role: 'sales',
    label: 'Sales',
    description: 'Receive and confirm incoming project leads',
    color: 'text-blue-400',
    gradient: 'from-blue-600 to-cyan-600',
    icon: 'TrendingUp',
    stage: 'sales',
  },
  survey: {
    role: 'survey',
    label: 'Survey',
    description: 'Conduct site surveys and field assessments',
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    icon: 'Map',
    stage: 'survey',
  },
  mapping: {
    role: 'mapping',
    label: 'Mapping',
    description: 'Produce site maps and topographic data',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-600',
    icon: 'Layers',
    stage: 'mapping',
  },
  drafting: {
    role: 'drafting',
    label: 'Drafting',
    description: 'Create technical drawings and CAD plans',
    color: 'text-pink-400',
    gradient: 'from-pink-600 to-rose-600',
    icon: 'PenTool',
    stage: 'drafting',
  },
  accounts: {
    role: 'accounts',
    label: 'Accounts',
    description: 'Handle billing, invoicing, and project closure',
    color: 'text-sky-400',
    gradient: 'from-sky-600 to-indigo-600',
    icon: 'DollarSign',
    stage: 'accounts',
  },
};

export const PIPELINE_STAGES: PipelineStage[] = [
  'sales',
  'survey',
  'mapping',
  'drafting',
  'accounts',
];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  sales: 'Sales',
  survey: 'Survey',
  mapping: 'Mapping',
  drafting: 'Drafting',
  accounts: 'Accounts',
};

export const USER_NAMES: Record<Role, string> = {
  admin: 'Arjun Mehta',
  sales: 'Priya Sharma',
  survey: 'Ravi Kumar',
  mapping: 'Sneha Patel',
  drafting: 'Anil Desai',
  accounts: 'Kavitha Nair',
};
