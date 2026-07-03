'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MapPin, Building2, Calendar, ChevronRight, Phone, ExternalLink, StickyNote, Clock } from 'lucide-react';
import { Project, PipelineStage } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  stage: PipelineStage;
  onAction?: (project: Project) => void;
  /** String label, or a function returning a label (or null to hide button) */
  actionLabel?: string | ((project: Project) => string | null);
  index?: number;
}

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

export function ProjectCard({ project, stage, onAction, actionLabel, index = 0 }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const stageRecord = project.stages[stage];
  const accent      = typeAccent[project.type] ?? 'border-l-slate-400';

  // Resolve label (string or function)
  const resolvedLabel = typeof actionLabel === 'function' ? actionLabel(project) : actionLabel;
  const canAct = onAction && resolvedLabel && stageRecord.status === 'in_progress';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ delay: index * 0.04, duration: 0.26 }}
      className={cn(
        'group relative rounded-2xl border-l-[3px] glass cursor-pointer',
        'hover:shadow-lg hover:shadow-black/6 dark:hover:shadow-black/30 transition-all duration-200',
        accent
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="px-4 pt-4 pb-3">
        {/* Header row — ID + status only (no priority badge) */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
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

        {/* Meta — client, location, phone (if available) */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="truncate font-medium">{project.client}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
            <span className="truncate">{project.location}</span>
          </div>
          {project.clientPhone && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
              <span className="truncate">{project.clientPhone}</span>
            </div>
          )}
        </div>

        {/* Footer — created date + deadline */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(project.createdAt)}
          </div>
          {project.deadline && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Clock className="w-3 h-3" />
              Due {formatDate(project.deadline)}
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded panel ──────────────────────────────────────────────── */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-200 dark:border-white/8 px-4 py-3 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Maps link */}
          {project.mapsLink && (
            <a
              href={project.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              View on Google Maps
            </a>
          )}

          {/* Stage notes */}
          {stageRecord.notes && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/8">
              <div className="flex items-center gap-1.5 mb-1">
                <StickyNote className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Stage Notes</p>
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

          {/* Action button */}
          {canAct && (
            <Button variant="primary" size="sm" className="w-full"
              onClick={(e) => { e.stopPropagation(); onAction!(project); }}>
              {resolvedLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
