'use client';

import { cn, getStatusColor, getStatusLabel, getPriorityColor } from '@/lib/utils';
import { StageStatus, Priority } from '@/types';

interface BadgeProps {
  label?: string;
  className?: string;
}

interface StatusBadgeProps extends BadgeProps {
  status: StageStatus;
}

interface PriorityBadgeProps extends BadgeProps {
  priority: Priority;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const dots: Record<StageStatus, string> = {
    pending: 'bg-amber-400',
    in_progress: 'bg-blue-400 animate-pulse',
    completed: 'bg-emerald-400',
    bypassed: 'bg-slate-500',
    waiting: 'bg-purple-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dots[status])} />
      {getStatusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const labels: Record<Priority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wide',
        getPriorityColor(priority),
        className
      )}
    >
      {labels[priority]}
    </span>
  );
}

export function RoleBadge({
  role,
  className,
}: {
  role: string;
  className?: string;
}) {
  const roleColors: Record<string, string> = {
    admin: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    sales: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    survey: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    mapping: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    drafting: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    accounts: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize',
        roleColors[role] ?? 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        className
      )}
    >
      {role}
    </span>
  );
}
