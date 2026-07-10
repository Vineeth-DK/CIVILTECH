'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Activity, XCircle, CheckCircle2, PlusCircle,
  TrendingUp, Map, Layers, PenTool, Box, DollarSign, Layers3, Trash2,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { ProjectTimeline } from '@/components/dashboard/ProjectTimeline';
import { DeleteModal } from '@/components/dashboard/ActionModal';
import { PriorityBadge } from '@/components/ui/Badge';
import { AddLeadModal } from '@/components/dashboard/AddLeadModal';
import { formatDate, formatCurrency, sortByNearestDate } from '@/lib/utils';
import { PipelineStage, Project } from '@/types';
import Image from 'next/image';

type ViewFilter = 'active' | 'completed' | 'all';

const DEPT_SECTIONS: { stage: PipelineStage; label: string; icon: React.FC<{className?: string}>; color: string }[] = [
  { stage: 'sales',         label: 'Sales',            icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { stage: 'survey',        label: 'Survey',           icon: Map,        color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { stage: 'mapping',       label: 'Mapping',          icon: Layers,     color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { stage: 'drawing',       label: 'Drawing',          icon: PenTool,    color: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { stage: 'visualization', label: '3D Visualization', icon: Box,        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { stage: 'accounts',      label: 'Accounts',         icon: DollarSign, color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' },
];

export default function AdminPage() {
  const { getAllProjects, searchQuery, dateFilter } = useProjectStore();
  const allProjects = getAllProjects();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('active');

  const dateFilteredProjects = useMemo(() => {
    if (dateFilter === 'all') return allProjects;
    const cutoff = new Date();
    if (dateFilter === 'week')    cutoff.setDate(cutoff.getDate() - 7);
    if (dateFilter === 'month')   cutoff.setMonth(cutoff.getMonth() - 1);
    if (dateFilter === 'quarter') cutoff.setMonth(cutoff.getMonth() - 3);
    if (dateFilter === 'year')    cutoff.setFullYear(cutoff.getFullYear() - 1);
    return allProjects.filter((p) => {
      const d = p.scheduledDate ?? p.deadline ?? p.createdAt;
      return new Date(d) >= cutoff;
    });
  }, [allProjects, dateFilter]);

  const active    = dateFilteredProjects.filter((p) => Object.values(p.stages).some((s) => s.status === 'in_progress' || s.status === 'cancellation_requested'));
  const completed = dateFilteredProjects.filter((p) => Object.values(p.stages).every((s) => s.status === 'completed' || s.status === 'bypassed'));
  const cancelled = dateFilteredProjects.filter((p) => Object.values(p.stages).some((s) => s.status === 'cancelled' || s.status === 'cancellation_requested'));

  const filterChips: { id: ViewFilter; label: string; count: number; color: string; activeColor: string }[] = [
    { id: 'active',    label: 'Active / Pending', count: active.length,    color: 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5', activeColor: 'border-blue-500 bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300' },
    { id: 'completed', label: 'Completed',         count: completed.length, color: 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5', activeColor: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
    { id: 'all',       label: 'All Projects',      count: dateFilteredProjects.length, color: 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5', activeColor: 'border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300' },
  ];

  // Filtered set for the pipeline view
  const filteredProjects = useMemo(() => {
    let base = dateFilteredProjects;
    
    const q = searchQuery.trim().toLowerCase();
    if (q) base = base.filter((p) => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));

    if (viewFilter === 'active') base = base.filter((p) => Object.values(p.stages).some((s) => s.status === 'in_progress' || s.status === 'cancellation_requested'));
    if (viewFilter === 'completed') base = base.filter((p) => Object.values(p.stages).every((s) => s.status === 'completed' || s.status === 'bypassed'));
    return sortByNearestDate(base);
  }, [dateFilteredProjects, searchQuery, viewFilter]);

  const stats = [
    { label: 'Total',     value: dateFilteredProjects.length, icon: <BarChart3 className="w-5 h-5 text-violet-500 dark:text-violet-400" />, color: 'bg-violet-500/10' },
    { label: 'Active',    value: active.length,       icon: <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />, color: 'bg-blue-500/10' },
    { label: 'Completed', value: completed.length,    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />, color: 'bg-emerald-500/10' },
    { label: 'Cancelled', value: cancelled.length,    icon: <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />, color: 'bg-red-500/10' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Admin Overview" subtitle="Full pipeline — use filters to switch views" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        <StatsRow stats={stats} />

        {/* ── Filter Chips ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips.map((chip) => (
            <button key={chip.id} onClick={() => setViewFilter(chip.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                viewFilter === chip.id ? chip.activeColor : chip.color
              }`}>
              {chip.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                viewFilter === chip.id ? 'bg-current/20' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
              }`}>{chip.count}</span>
            </button>
          ))}
          <div className="ml-auto">
            <button onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-all hover:-translate-y-0.5">
              <PlusCircle className="w-3.5 h-3.5" /> Add Lead
            </button>
          </div>
        </div>

        {/* ── Dept-Grouped Pending Sections ─────────────────────────────────── */}
        {viewFilter === 'active' && (
          <div className="space-y-4">
            {DEPT_SECTIONS.map(({ stage, label, icon: Icon, color }) => {
              const deptProjects = sortByNearestDate(
                filteredProjects.filter((p) =>
                  p.stages?.[stage]?.status === 'in_progress' || p.stages?.[stage]?.status === 'cancellation_requested'
                )
              );
              if (deptProjects.length === 0) return null;
              return (
                <DeptSection key={stage} stage={stage} label={label} color={color} Icon={Icon} projects={deptProjects} />
              );
            })}
            {filteredProjects.length === 0 && <EmptyPipeline message="No active projects" sub="All projects are completed or pending assignment." />}
          </div>
        )}

        {/* ── Completed Projects ────────────────────────────────────────────── */}
        {viewFilter === 'completed' && (
          <div className="glass rounded-2xl overflow-hidden">
            <SectionHeader label="Completed Projects" count={filteredProjects.length} />
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence>
                {filteredProjects.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} />)}
              </AnimatePresence>
              {filteredProjects.length === 0 && <EmptyPipeline message="No completed projects yet" sub="Projects appear here after all stages are done." />}
            </div>
          </div>
        )}

        {/* ── All Projects Pipeline ─────────────────────────────────────────── */}
        {viewFilter === 'all' && (
          <div className="glass rounded-2xl overflow-hidden">
            <SectionHeader label="All Projects — Pipeline View" count={filteredProjects.length} />
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence>
                {filteredProjects.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} />)}
              </AnimatePresence>
              {filteredProjects.length === 0 && <EmptyPipeline message="No projects match search" sub="Try a different search term." />}
            </div>
          </div>
        )}
      </div>

      <AddLeadModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}

// ── Dept Section ──────────────────────────────────────────────────────────────

function DeptSection({ stage, label, color, Icon, projects }: {
  stage: PipelineStage; label: string; color: string; Icon: React.FC<{className?: string}>; projects: Project[];
}) {
  const pending    = projects.filter((p) => p.stages[stage]?.status === 'in_progress');
  const requested  = projects.filter((p) => p.stages[stage]?.status === 'cancellation_requested');

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200/50 dark:border-white/5">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${color}`}>
          <Icon className="w-3.5 h-3.5" />{label}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">{projects.length} active</span>
        {requested.length > 0 && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[11px] font-semibold border border-orange-200 dark:border-orange-500/25">
            ⚠ {requested.length} cancel request{requested.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <p className="px-5 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pending ({pending.length})</p>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {pending.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} highlightStage={stage} />)}
          </div>
        </div>
      )}

      {/* Cancellation requests */}
      {requested.length > 0 && (
        <div className="bg-orange-50/50 dark:bg-orange-500/5">
          <p className="px-5 pt-2.5 pb-1 text-[10px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest">⚠ Cancellation Requests ({requested.length})</p>
          <div className="divide-y divide-orange-100 dark:divide-orange-500/10">
            {requested.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} highlightStage={stage} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared project row ────────────────────────────────────────────────────────

function AdminProjectRow({ project, index, highlightStage }: {
  project: Project; index: number; highlightStage?: PipelineStage;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const stageColors: Record<string, string> = {
    sales:         'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    survey:        'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    mapping:       'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    drawing:       'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20',
    visualization: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    accounts:      'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
  };
  const stageLabel: Record<string, string> = { sales: 'Sales', survey: 'Survey', mapping: 'Mapping', drawing: 'Drawing', visualization: '3D Viz', accounts: 'Accounts' };
  const wfLabel: Record<string, string> = { marking: '📍 Marking', mapping: '🗺️ Mapping', drawing: '✏️ Drawing', visualization: '🏗️ 3D Viz' };

  const displayDate = project.scheduledDate ?? project.deadline;
  const isScheduled = !!project.scheduledDate;

  const cancelRequested = highlightStage && project.stages[highlightStage]?.status === 'cancellation_requested';

  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
      className={`px-5 py-3 transition-colors ${cancelRequested ? 'bg-orange-50/40 dark:bg-orange-500/5' : 'hover:bg-slate-50/60 dark:hover:bg-white/3'}`}>
      <div className="flex items-start justify-between gap-4 mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{project.id}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${stageColors[project.currentStage]}`}>{stageLabel[project.currentStage]}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{wfLabel[project.workflowType]}</span>
            {cancelRequested && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold text-orange-600 dark:text-orange-300 bg-orange-100 dark:bg-orange-500/15 border-orange-200 dark:border-orange-500/25 animate-pulse">
                ⚠ Cancel Requested
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{project.name}</h3>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-slate-500">{project.client}</span>
            {project.value > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">₹{formatCurrency(project.value)}</span>
            )}
          </div>
          {cancelRequested && highlightStage && project.stages[highlightStage]?.cancelReason && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 italic">"{project.stages[highlightStage].cancelReason}"</p>
          )}
        </div>
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(project.createdAt)}</p>
          {displayDate && (
            <p className={`text-xs ${isScheduled ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isScheduled ? '📅' : '⏰'} {formatDate(displayDate)}
            </p>
          )}
          <button onClick={() => setIsDeleteOpen(true)} className="p-1 mt-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <ProjectTimeline project={project} />
      <DeleteModal project={project} isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </motion.div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/50 dark:border-white/5">
      <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">{label}</h2>
      <span className="text-xs text-slate-400 dark:text-slate-500">{count} project{count !== 1 ? 's' : ''}</span>
    </div>
  );
}

function EmptyPipeline({ message, sub }: { message: string; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 glass rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
        <Layers3 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{message}</p>
      <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">{sub}</p>
    </motion.div>
  );
}
