'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Map,
  Layers,
  PenTool,
  DollarSign,
  Check,
  X,
  SkipForward,
  ArrowRight,
} from 'lucide-react';
import { Project, PipelineStage, StageStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectTimelineProps {
  project: Project;
}

const stageConfig = [
  { key: 'sales' as PipelineStage,    label: 'Sales',    icon: TrendingUp, color: 'blue' },
  { key: 'survey' as PipelineStage,   label: 'Survey',   icon: Map,        color: 'amber' },
  { key: 'mapping' as PipelineStage,  label: 'Mapping',  icon: Layers,     color: 'emerald' },
  { key: 'drafting' as PipelineStage, label: 'Drafting', icon: PenTool,    color: 'pink' },
  { key: 'accounts' as PipelineStage, label: 'Accounts', icon: DollarSign, color: 'sky' },
];

const colorMap: Record<string, Record<string, string>> = {
  blue:    { bg: 'bg-blue-500',    border: 'border-blue-500',    text: 'text-blue-600 dark:text-blue-400',    glow: 'shadow-blue-500/30',    light: 'bg-blue-500/15 dark:bg-blue-500/10' },
  amber:   { bg: 'bg-amber-500',   border: 'border-amber-500',   text: 'text-amber-600 dark:text-amber-400',   glow: 'shadow-amber-500/30',   light: 'bg-amber-500/15 dark:bg-amber-500/10' },
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', glow: 'shadow-emerald-500/30', light: 'bg-emerald-500/15 dark:bg-emerald-500/10' },
  pink:    { bg: 'bg-pink-500',    border: 'border-pink-500',    text: 'text-pink-600 dark:text-pink-400',    glow: 'shadow-pink-500/30',    light: 'bg-pink-500/15 dark:bg-pink-500/10' },
  sky:     { bg: 'bg-sky-500',     border: 'border-sky-500',     text: 'text-sky-600 dark:text-sky-400',     glow: 'shadow-sky-500/30',     light: 'bg-sky-500/15 dark:bg-sky-500/10' },
};

function getNodeStyle(status: StageStatus, color: string) {
  const c = colorMap[color];
  switch (status) {
    case 'completed':
      return {
        node: cn('w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-lg', c.bg, c.border, c.glow),
        icon: <Check className="w-4 h-4 text-white" strokeWidth={3} />,
      };
    case 'in_progress':
      return {
        node: cn('w-9 h-9 rounded-full flex items-center justify-center border-2 animate-pulse', c.light, c.border),
        icon: <ArrowRight className={cn('w-4 h-4', c.text)} />,
      };
    case 'bypassed':
      return {
        node: 'w-9 h-9 rounded-full flex items-center justify-center border-2 bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
        icon: <SkipForward className="w-4 h-4 text-slate-400 dark:text-slate-500" />,
      };
    default:
      return {
        node: 'w-9 h-9 rounded-full flex items-center justify-center border-2 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
        icon: <X className="w-3 h-3 text-slate-300 dark:text-slate-600" />,
      };
  }
}

export function ProjectTimeline({ project }: ProjectTimelineProps) {
  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto py-2">
      {stageConfig.map((stage, i) => {
        const record = project.stages[stage.key];
        const { node, icon } = getNodeStyle(record.status, stage.color);
        const c = colorMap[stage.color];
        const isLast = i === stageConfig.length - 1;
        const nextStage = stageConfig[i + 1];
        const nextStatus = nextStage ? project.stages[nextStage.key].status : null;

        return (
          <div key={stage.key} className="flex items-center flex-shrink-0">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className={cn(node, 'relative group cursor-default')}
                title={`${stage.label}: ${record.status}`}
              >
                {icon}

                {/* Tooltip */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  <p className="font-semibold mb-0.5">{stage.label}</p>
                  <p className="text-slate-500 dark:text-slate-400 capitalize">
                    {record.status.replace('_', ' ')}
                  </p>
                  {record.completedAt && (
                    <p className="text-slate-400 dark:text-slate-500">
                      {new Date(record.completedAt).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              </motion.div>

              <span
                className={cn(
                  'text-xs font-medium',
                  record.status === 'completed' || record.status === 'in_progress'
                    ? c.text
                    : 'text-slate-400 dark:text-slate-600'
                )}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.1 + 0.1 }}
                className={cn(
                  'h-0.5 w-10 mx-1 origin-left rounded-full',
                  record.status === 'completed'
                    ? 'bg-slate-300 dark:bg-white/20'
                    : nextStatus === 'bypassed'
                    ? 'bg-slate-200 dark:bg-slate-700 opacity-50'
                    : 'bg-slate-200 dark:bg-slate-700'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
