'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PenTool, Activity, CheckCircle2, BarChart2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { GenericActionModal } from '@/components/dashboard/ActionModal';
import { Project } from '@/types';
import { applyFilters } from '@/lib/utils';

export default function DraftingPage() {
  const { projects, currentFilter, searchQuery, dateFilter, completeDrafting } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allTouched = projects.filter((p) => p.stages.drafting.status !== 'pending' && p.stages.drafting.status !== 'bypassed');
  const pending    = allTouched.filter((p) => p.stages.drafting.status === 'in_progress').length;
  const completed  = allTouched.filter((p) => p.stages.drafting.status === 'completed').length;

  const displayed = useMemo(
    () => applyFilters(projects, 'drafting', currentFilter, searchQuery, dateFilter, true),
    [projects, currentFilter, searchQuery, dateFilter],
  );

  const stats = [
    { label: 'Total',     value: allTouched.length, icon: <PenTool className="w-5 h-5 text-pink-500 dark:text-pink-400" />, color: 'bg-pink-500/10' },
    { label: 'Pending',   value: pending,            icon: <Activity className="w-5 h-5 text-rose-500 dark:text-rose-400" />, color: 'bg-rose-500/10' },
    { label: 'Completed', value: completed,           icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />, color: 'bg-emerald-500/10' },
    { label: 'Showing',   value: displayed.length,   icon: <BarChart2 className="w-5 h-5 text-slate-400 dark:text-slate-500" />, color: 'bg-slate-500/10' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Drafting" subtitle="CAD drawings & documentation" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        <StatsRow stats={stats} />
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
              Projects <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">{displayed.length} result{displayed.length !== 1 ? 's' : ''}</span>
            </h2>
          </div>
          {displayed.length === 0 ? <EmptyState /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {displayed.map((project, i) => (
                  <ProjectCard key={project.id} project={project} stage="drafting"
                    onAction={(p) => { setSelectedProject(p); setIsModalOpen(true); }}
                    actionLabel="Complete Drafting →" index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <GenericActionModal project={selectedProject} isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
        title="Complete Drafting" description="Mark drawings finalised. Project routes to Accounts for invoicing."
        actionLabel="Complete Drafting" onConfirm={completeDrafting} variant="primary" accentColor="pink" />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
        <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No projects match your filters</p>
      <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Adjust the sidebar filter or search</p>
    </motion.div>
  );
}
