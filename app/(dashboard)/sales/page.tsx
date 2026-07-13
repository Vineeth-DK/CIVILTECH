'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TrendingUp, Activity, BarChart2, PlusCircle, XCircle } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { SalesActionModal } from '@/components/dashboard/ActionModal';
import { AddLeadModal } from '@/components/dashboard/AddLeadModal';
import { EditLeadModal } from '@/components/dashboard/EditLeadModal';
import { Project } from '@/types';
import { applyFilters, sortByNearestDate } from '@/lib/utils';

export default function SalesPage() {
  const { projects, searchQuery, dateFilter } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const allTouched = projects.filter((p) =>
    p.stages.sales.status !== 'pending' && p.stages.sales.status !== 'bypassed'
  );
  const pending   = allTouched.filter((p) => p.stages.sales.status === 'in_progress').length;
  const cancelled = allTouched.filter((p) => p.stages.sales.status === 'cancelled').length;

  // Only show pending (in_progress) for the main list
  const displayed = useMemo(
    () => applyFilters(projects, 'sales', 'in_progress', searchQuery, dateFilter, true, true),
    [projects, searchQuery, dateFilter],
  );

  // Cancelled projects — for rescheduling
  const cancelledProjects = useMemo(
    () => sortByNearestDate(projects.filter((p) => p.stages.sales.status === 'cancelled')),
    [projects],
  );

  // Also show projects with cancelled stages in other depts that need sales attention
  const cancelledDownstream = useMemo(
    () => sortByNearestDate(projects.filter((p) =>
      p.stages.sales.status === 'completed' &&
      Object.entries(p.stages).some(([, s]) => s.status === 'cancelled')
    )),
    [projects],
  );

  const allCancelled = [...cancelledProjects, ...cancelledDownstream];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Sales" subtitle="Lead management & confirmation" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">

        {/* ── Pending Leads ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
              Pending Leads
            </h2>
            <button onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-all hover:-translate-y-0.5">
              <PlusCircle className="w-3.5 h-3.5" /> Add Lead
            </button>
          </div>
          {displayed.length === 0 ? <EmptyState message="No pending leads" sub="All leads have been confirmed!" icon={<TrendingUp />} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {displayed.map((project, i) => (
                  <ProjectCard key={project.id} project={project} stage="sales"
                    onAction={(p) => { setSelectedProject(p); setIsActionOpen(true); }}
                    onEdit={(p) => { setSelectedProject(p); setIsEditOpen(true); }}
                    actionLabel="Confirm Lead →" index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ── Cancelled / Pending Reschedule ──────────────────────── */}
        {allCancelled.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Cancelled — Needs Rescheduling
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">{allCancelled.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {allCancelled.map((project, i) => {
                  const cancelledStage = (['survey','mapping','drawing','visualization','accounts'] as const)
                    .find((s) => project.stages[s]?.status === 'cancelled') ?? 'sales';
                  return (
                    <ProjectCard key={project.id} project={project} stage={cancelledStage}
                      showReschedule index={i} />
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        )}
      </div>

      <SalesActionModal project={selectedProject} isOpen={isActionOpen}
        onClose={() => { setIsActionOpen(false); setSelectedProject(null); }} />
      <AddLeadModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditLeadModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedProject(null); }} project={selectedProject} />
    </div>
  );
}

function EmptyState({ message, sub, icon }: { message: string; sub: string; icon: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 [&>svg]:w-6 [&>svg]:h-6 [&>svg]:text-slate-300 dark:[&>svg]:text-slate-600">{icon}</div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{message}</p>
      <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">{sub}</p>
    </motion.div>
  );
}
