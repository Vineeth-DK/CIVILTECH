'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MapPin, Building2, Calendar, ChevronRight, Phone, ExternalLink, StickyNote, Clock, IndianRupee, XCircle, CalendarClock, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Project, PipelineStage } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { CancelModal, RescheduleModal, RevertModal } from '@/components/dashboard/ActionModal';

/** Roles that can see project financial value */
const VALUE_VISIBLE_ROLES = ['admin', 'sales', 'accounts'];

/** Field-visit stages — show scheduledDate instead of deadline */
const FIELD_STAGES: PipelineStage[] = ['survey', 'mapping'];

const typeAccent: Record<string, string> = {
  'Road Construction':      'border-l-blue-500',
  'Bridge Engineering':     'border-l-violet-500',
  'Drainage System':        'border-l-cyan-500',
  'Structural Audit':       'border-l-amber-500',
  'Land Survey':            'border-l-emerald-500',
  'Residential Layout':     'border-l-pink-500',
  'Commercial Development': 'border-l-orange-500',
  'Water Treatment':        'border-l-sky-500',
  'Highway Expansion':      'border-l-indigo-500',
  'Flyover Design':         'border-l-rose-500',
};

interface ProjectCardProps {
  project: Project;
  stage: PipelineStage;
  onAction?: (project: Project) => void;
  actionLabel?: string | ((project: Project) => string | null);
  /** If true, show a Reschedule button instead of action (for cancelled projects in Sales/Admin) */
  showReschedule?: boolean;
  index?: number;
}

export function ProjectCard({ project, stage, onAction, actionLabel, showReschedule, index = 0 }: ProjectCardProps) {
  const [expanded, setExpanded]       = useState(false);
  const [isCancelOpen, setIsCancelOpen]     = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isRevertOpen, setIsRevertOpen]         = useState(false);

  const { currentUser } = useProjectStore();
  const role = currentUser?.role ?? 'admin';
  const stageRecord = project.stages[stage];
  const accent      = typeAccent[project.type] ?? 'border-l-slate-400';

  const showValue    = VALUE_VISIBLE_ROLES.includes(role) && project.value > 0;
  const isFieldStage = FIELD_STAGES.includes(stage);
  const isCancelled           = stageRecord?.status === 'cancelled';
  const isCancelRequested      = stageRecord?.status === 'cancellation_requested';

  const resolvedLabel = typeof actionLabel === 'function' ? actionLabel(project) : actionLabel;
  const canAct = onAction && resolvedLabel && stageRecord?.status === 'in_progress';

  const STAGES: PipelineStage[] = ['sales', 'survey', 'mapping', 'drawing', 'visualization', 'accounts'];
  const currentIndex = STAGES.indexOf(stage);
  const hasCompletedPrev = STAGES.slice(0, currentIndex).some(s => project.stages[s]?.status === 'completed');

  // Date display logic
  const displayDate = isFieldStage
    ? stageRecord.scheduledDate ?? project.scheduledDate
    : project.deadline;

  const dateLabel = isFieldStage ? 'Visit' : 'Due';

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ delay: index * 0.04, duration: 0.26 }}
        className={cn(
          'group relative rounded-2xl border-l-[3px] glass cursor-pointer',
          'hover:shadow-lg hover:shadow-black/6 dark:hover:shadow-black/30 transition-all duration-200',
          isCancelled && 'opacity-75',
          accent
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="px-4 pt-4 pb-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0">
                  {project.id}
                </span>
                <StatusBadge status={stageRecord.status} />
              </div>
              <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                {project.name}
              </h3>
            </div>
            <ChevronRight className={cn('w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200', expanded && 'rotate-90')} />
          </div>

          {/* Meta */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="truncate font-medium">{project.client}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="truncate">{project.location.startsWith('http') ? 'View on Maps' : project.location}</span>
            </div>
            {project.clientPhone && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                <span className="truncate">{project.clientPhone}</span>
              </div>
            )}
            {showValue && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <IndianRupee className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formatCurrency(project.value)}</span>
              </div>
            )}
          </div>

          {/* Footer — dates */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(project.createdAt)}
            </div>
            {displayDate && (
              <div className={cn(
                'flex items-center gap-1',
                isFieldStage ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
              )}>
                {isFieldStage ? <CalendarClock className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {dateLabel} {formatDate(displayDate)}
              </div>
            )}
          </div>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 dark:border-white/8 px-4 py-3 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Maps link */}
            {project.location.startsWith('http') && (
              <a href={project.location} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />View on Google Maps
              </a>
            )}

            {/* Cancellation Request pending admin banner */}
            {isCancelRequested && stageRecord.cancelReason && (
              <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                  <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider">Awaiting Admin Approval</p>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed italic">"{stageRecord.cancelReason}"</p>
              </div>
            )}

            {/* Cancel reason (fully cancelled) */}
            {isCancelled && stageRecord.cancelReason && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Cancellation Reason</p>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{stageRecord.cancelReason}</p>
              </div>
            )}

            {/* Stage notes */}
            {stageRecord.notes && !isCancelled && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/8">
                <div className="flex items-center gap-1.5 mb-1">
                  <StickyNote className="w-3 h-3 text-slate-400" />
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Notes</p>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{stageRecord.notes}</p>
              </div>
            )}

            {/* Survey reached indicator */}
            {stage === 'survey' && stageRecord.reachedAt && stageRecord.status === 'in_progress' && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                Site reached — ready to complete survey
              </div>
            )}

            {/* Parallel info for marking workflow */}
            {(project.workflowType === 'marking') && (stage === 'survey' || stage === 'mapping') && stageRecord.status === 'in_progress' && (
              <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-400">
                <CalendarClock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Marking workflow — Survey &amp; Mapping work in parallel. Both must complete before Accounts.</span>
              </div>
            )}

            {/* Action button */}
            {canAct && (
              <Button variant="primary" size="sm" className="w-full"
                onClick={(e) => { e.stopPropagation(); onAction!(project); }}>
                {resolvedLabel}
              </Button>
            )}

            {/* Reschedule button (for Sales/Admin on cancelled) */}
            {showReschedule && isCancelled && (
              <Button variant="primary" size="sm" className="w-full"
                onClick={(e) => { e.stopPropagation(); setIsRescheduleOpen(true); }}>
                Reschedule →
              </Button>
            )}

            {/* Cancel / Revert buttons — available to dept worker only if in_progress (not already requested) */}
            {!showReschedule && !isCancelled && !isCancelRequested && stageRecord.status === 'in_progress' && (
              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsCancelOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" /> Request Cancel
                </button>
                {hasCompletedPrev && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsRevertOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 transition-all"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Revert Project
                  </button>
                )}
              </div>
            )}

            {/* Survey-only direct reschedule button (does not change status) */}
            {!isCancelled && stageRecord.status === 'in_progress' && role === 'survey' && stage === 'survey' && (
              <Button variant="secondary" size="sm" className="w-full mt-2"
                onClick={(e) => { e.stopPropagation(); setIsRescheduleOpen(true); }}>
                Reschedule Visit (Client Request)
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Modals */}
      <CancelModal project={project} stage={stage} isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)} />
      <RescheduleModal project={project} stage={stage} isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)} />
      <RevertModal project={project} stage={stage} isOpen={isRevertOpen}
        onClose={() => setIsRevertOpen(false)} />
    </>
  );
}
