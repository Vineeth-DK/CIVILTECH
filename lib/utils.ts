import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StageStatus, Priority, Project, PipelineStage, StatusFilter, DateFilter } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCurrency(value: number): string {
  if (value >= 100) {
    return `₹${(value / 100).toFixed(2)} Cr`;
  }
  return `₹${value.toFixed(2)} L`;
}

export function getStatusColor(status: StageStatus): string {
  const colors: Record<StageStatus, string> = {
    pending:     'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    in_progress: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
    completed:   'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    bypassed:    'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/25',
    waiting:     'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25',
  };
  return colors[status];
}

export function getStatusLabel(status: StageStatus): string {
  const labels: Record<StageStatus, string> = {
    pending:     'Pending',
    in_progress: 'In Progress',
    completed:   'Completed',
    bypassed:    'Bypassed',
    waiting:     'Waiting',
  };
  return labels[status];
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    low:      'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/25',
    medium:   'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
    high:     'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/25',
    critical: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
  };
  return colors[priority];
}

export function getStageIndex(stage: string): number {
  const stages = ['sales', 'survey', 'mapping', 'drafting', 'accounts'];
  return stages.indexOf(stage);
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

/**
 * Central filter function used by all department pages.
 * Applies: status filter, text search, and date range — in that order.
 * Pass excludeBypassed=true for non-admin depts to hide bypassed projects.
 */
export function applyFilters(
  projects: Project[],
  stage: PipelineStage,
  statusFilter: StatusFilter,
  searchQuery: string,
  dateFilter: DateFilter,
  excludeBypassed = false,
): Project[] {
  // 1. Only projects where this department has been reached
  let result = projects.filter((p) => {
    const s = p.stages[stage].status;
    if (s === 'pending') return false;
    if (excludeBypassed && s === 'bypassed') return false;
    return true;
  });

  // 2. Status filter
  if (statusFilter !== 'all') {
    result = result.filter((p) => p.stages[stage].status === statusFilter);
  }

  // 3. Full-text search (name, client, id, location, phone)
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        (p.clientPhone ?? '').includes(q),
    );
  }

  // 4. Date filter — based on updatedAt
  if (dateFilter !== 'all') {
    const now = new Date();
    const cutoff = new Date(now);
    if (dateFilter === 'today') cutoff.setHours(0, 0, 0, 0);
    if (dateFilter === 'week')  cutoff.setDate(cutoff.getDate() - 7);
    if (dateFilter === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
    if (dateFilter === 'year')  cutoff.setFullYear(cutoff.getFullYear() - 1);
    result = result.filter((p) => new Date(p.updatedAt) >= cutoff);
  }

  return result;
}

/**
 * Apply search + date filter to ALL projects (for Admin god view).
 */
export function applyAdminFilters(
  projects: Project[],
  searchQuery: string,
  dateFilter: DateFilter,
): Project[] {
  let result = [...projects];

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q),
    );
  }

  if (dateFilter !== 'all') {
    const now = new Date();
    const cutoff = new Date(now);
    if (dateFilter === 'today') cutoff.setHours(0, 0, 0, 0);
    if (dateFilter === 'week')  cutoff.setDate(cutoff.getDate() - 7);
    if (dateFilter === 'month') cutoff.setMonth(cutoff.getMonth() - 1);
    if (dateFilter === 'year')  cutoff.setFullYear(cutoff.getFullYear() - 1);
    result = result.filter((p) => new Date(p.updatedAt) >= cutoff);
  }

  return result;
}
