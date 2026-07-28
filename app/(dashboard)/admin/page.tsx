'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Activity, XCircle, CheckCircle2, PlusCircle,
  TrendingUp, Map, Layers, PenTool, Box, DollarSign, Layers3, Trash2, Pen, UploadCloud, RotateCcw, AlertTriangle
} from 'lucide-react';
import Papa from 'papaparse';
import { useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { ProjectTimeline } from '@/components/dashboard/ProjectTimeline';
import { DeleteModal } from '@/components/dashboard/ActionModal';
import { PriorityBadge } from '@/components/ui/Badge';
import { AddLeadModal } from '@/components/dashboard/AddLeadModal';
import { EditLeadModal } from '@/components/dashboard/EditLeadModal';
import { formatDate, formatCurrency, sortByNearestDate } from '@/lib/utils';
import { PipelineStage, Project } from '@/types';
import Image from 'next/image';

type ViewFilter = 'active' | 'completed' | 'all' | 'edits' | 'trash';

const DEPT_SECTIONS: { stage: PipelineStage; label: string; icon: React.FC<{className?: string}>; color: string }[] = [
  { stage: 'sales',         label: 'Sales',            icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { stage: 'survey',        label: 'Survey',           icon: Map,        color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { stage: 'mapping',       label: 'Mapping',          icon: Layers,     color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { stage: 'drawing',       label: 'Drawing',          icon: PenTool,    color: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { stage: 'visualization', label: '3D Visualization', icon: Box,        color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { stage: 'accounts',      label: 'Accounts',         icon: DollarSign, color: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' },
];

export default function AdminPage() {
  const { getAllProjects, getDeletedProjects, searchQuery, dateFilter } = useProjectStore();
  const allProjects = getAllProjects();
  const deletedProjects = getDeletedProjects();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('active');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addLead } = useProjectStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        let added = 0;
        data.forEach(row => {
          if (row.name && row.client && row.workflowType) {
            addLead({
              name: row.name,
              client: row.client,
              clientPhone: row.clientPhone || '',
              location: row.location || '',
              type: row.type as any || 'residential',
              workflowType: row.workflowType as any,
              value: Number(row.value) || 0,
              description: row.description || '',
            });
            added++;
          }
        });
        alert(`Successfully imported ${added} projects.`);
      },
      error: (error: Error) => {
        console.error('Error parsing CSV', error);
        alert('Error parsing CSV');
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    { id: 'edits',     label: 'Edit Requests',     count: dateFilteredProjects.filter(p => p.editRequest).length, color: 'border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10', activeColor: 'border-amber-500 bg-amber-500 text-white shadow-md' },
    { id: 'trash',     label: '🗑 Trash',           count: deletedProjects.length, color: 'border-red-200 dark:border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10', activeColor: 'border-red-500 bg-red-500 text-white shadow-md' },
  ];

  // Filtered set for the pipeline view
  const filteredProjects = useMemo(() => {
    let base = dateFilteredProjects;
    
    const q = searchQuery.trim().toLowerCase();
    if (q) base = base.filter((p) => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));

    if (viewFilter === 'active') base = base.filter((p) => Object.values(p.stages).some((s) => s.status === 'in_progress' || s.status === 'cancellation_requested'));
    if (viewFilter === 'completed') base = base.filter((p) => Object.values(p.stages).every((s) => s.status === 'completed' || s.status === 'bypassed'));
    if (viewFilter === 'edits') base = base.filter((p) => p.editRequest);

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
          <div className="ml-auto flex items-center gap-2">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
            />
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/30 transition-all hover:-translate-y-0.5">
              <UploadCloud className="w-3.5 h-3.5" /> Bulk Import
            </button>
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
                <DeptSection key={stage} stage={stage} label={label} color={color} Icon={Icon} projects={deptProjects} onEdit={(p) => { setSelectedProject(p); setIsEditOpen(true); }} />
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
                {filteredProjects.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} onEdit={(p) => { setSelectedProject(p); setIsEditOpen(true); }} />)}
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
                {filteredProjects.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} onEdit={(p) => { setSelectedProject(p); setIsEditOpen(true); }} />)}
              </AnimatePresence>
              {filteredProjects.length === 0 && <EmptyPipeline message="No projects match search" sub="Try a different search term." />}
            </div>
          </div>
        )}
        {/* ── Edit Requests ─────────────────────────────────────────── */}
        {viewFilter === 'edits' && (
          <div className="glass rounded-2xl overflow-hidden">
            <SectionHeader label="Pending Edit Requests" count={filteredProjects.length} />
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              <AnimatePresence>
                {filteredProjects.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} onEdit={(p) => { setSelectedProject(p); setIsEditOpen(true); }} />)}
              </AnimatePresence>
              {filteredProjects.length === 0 && <EmptyPipeline message="No edit requests" sub="All caught up!" />}
            </div>
          </div>
        )}
        {/* ── Trash ─────────────────────────────────────────────────────────── */}
        {viewFilter === 'trash' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/50 dark:border-white/5">
              <div>
                <h2 className="font-display font-semibold text-red-600 dark:text-red-400 text-sm">🗑 Trash</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Deleted leads — restore or permanently delete</p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">{deletedProjects.length} item{deletedProjects.length !== 1 ? 's' : ''}</span>
            </div>
            {deletedProjects.length === 0 ? (
              <EmptyPipeline message="Trash is empty" sub="Deleted leads will appear here." />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                <AnimatePresence>
                  {deletedProjects.map((p, i) => <TrashRow key={p.id} project={p} index={i} />)}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      <AddLeadModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditLeadModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedProject(null); }} project={selectedProject} />
    </div>
  );
}

// ── Dept Section ──────────────────────────────────────────────────────────────

function DeptSection({ stage, label, color, Icon, projects, onEdit }: {
  stage: PipelineStage; label: string; color: string; Icon: React.FC<{className?: string}>; projects: Project[]; onEdit: (p: Project) => void;
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
            {pending.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} highlightStage={stage} onEdit={onEdit} />)}
          </div>
        </div>
      )}

      {/* Cancellation requests */}
      {requested.length > 0 && (
        <div className="bg-orange-50/50 dark:bg-orange-500/5">
          <p className="px-5 pt-2.5 pb-1 text-[10px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-widest">⚠ Cancellation Requests ({requested.length})</p>
          <div className="divide-y divide-orange-100 dark:divide-orange-500/10">
            {requested.map((p, i) => <AdminProjectRow key={p.id} project={p} index={i} highlightStage={stage} onEdit={onEdit} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared project row ────────────────────────────────────────────────────────

function AdminProjectRow({ project, index, highlightStage, onEdit }: {
  project: Project; index: number; highlightStage?: PipelineStage; onEdit?: (p: Project) => void;
}) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { approveEdit, rejectEdit } = useProjectStore();
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
            {project.editRequest && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30">
                ✏️ Edit Pending
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{project.name}</h3>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-slate-500">{project.client}</span>
            {project.value > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(project.value)}</span>
            )}
          </div>
          {cancelRequested && highlightStage && project.stages[highlightStage]?.cancelReason && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 italic">"{project.stages[highlightStage].cancelReason}"</p>
          )}
          {project.editRequest && (
            <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-1">Edit Proposed by {project.editRequest.requestedBy}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mb-2">
                {Object.entries(project.editRequest.updates).map(([k, v]) => (
                  <span key={k}><strong>{k}:</strong> {String(v)}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); approveEdit(project.id); }} className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm">
                  Approve
                </button>
                <button onClick={(e) => { e.stopPropagation(); rejectEdit(project.id); }} className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(project.createdAt)}</p>
          {displayDate && (
            <p className={`text-xs ${isScheduled ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isScheduled ? '📅' : '⏰'} {formatDate(displayDate)}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1">
            {onEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(project); }} className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors">
                <Pen className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => setIsDeleteOpen(true)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
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

// ── Trash Row ─────────────────────────────────────────────────────────────────

function TrashRow({ project, index }: { project: Project; index: number }) {
  const { restoreProject, permanentlyDeleteProject } = useProjectStore();
  const [confirming, setConfirming] = useState(false);

  const stageLabel: Record<string, string> = { sales: 'Sales', survey: 'Survey', mapping: 'Mapping', drawing: 'Drawing', visualization: '3D Viz', accounts: 'Accounts' };
  const stageColors: Record<string, string> = {
    sales:         'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    survey:        'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    mapping:       'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    drawing:       'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20',
    visualization: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    accounts:      'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
      transition={{ delay: index * 0.03 }}
      className="px-5 py-3 bg-red-50/30 dark:bg-red-500/5 hover:bg-red-50/60 dark:hover:bg-red-500/8 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{project.id}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${stageColors[project.currentStage]}`}>{stageLabel[project.currentStage]}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20">Deleted</span>
          </div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm leading-snug line-through opacity-60">{project.name}</h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400 dark:text-slate-500">{project.client}</span>
            {project.value > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(project.value)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {/* Restore */}
          <button
            onClick={() => restoreProject(project.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore
          </button>
          {/* Permanently delete */}
          {confirming ? (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-red-500 font-medium">Sure?</span>
              <button onClick={() => permanentlyDeleteProject(project.id)}
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-red-500 hover:bg-red-600 text-white transition-colors">Yes</button>
              <button onClick={() => setConfirming(false)}
                className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all"
              title="Permanently Delete"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
