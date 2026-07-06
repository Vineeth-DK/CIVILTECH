'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Activity, BarChart2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { GenericActionModal } from '@/components/dashboard/ActionModal';
import { Project } from '@/types';
import { applyFilters } from '@/lib/utils';

export default function VisualizationPage() {
  const { projects, searchQuery, dateFilter, completeVisualization } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allTouched = projects.filter((p) =>
    p.stages.visualization.status !== 'pending' && p.stages.visualization.status !== 'bypassed'
  );
  const pending = allTouched.filter((p) => p.stages.visualization.status === 'in_progress').length;

  // Only show pending — completed hidden from non-admin; sorted nearest deadline first
  const displayed = useMemo(
    () => applyFilters(projects, 'visualization', 'in_progress', searchQuery, dateFilter, true, true),
    [projects, searchQuery, dateFilter],
  );

  const stats = [
    { label: 'Total Received', value: allTouched.length,  icon: <Box className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />, color: 'bg-indigo-500/10' },
    { label: 'Pending',        value: pending,             icon: <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />, color: 'bg-blue-500/10' },
    { label: 'Showing',        value: displayed.length,    icon: <BarChart2 className="w-5 h-5 text-slate-400 dark:text-slate-500" />, color: 'bg-slate-500/10' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="3D Visualization" subtitle="3D models, renders & visual presentations — sorted by deadline" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        <StatsRow stats={stats} />
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
              Pending Tasks <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">{displayed.length} result{displayed.length !== 1 ? 's' : ''}</span>
            </h2>
          </div>
          {displayed.length === 0 ? <EmptyState /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {displayed.map((project, i) => (
                  <ProjectCard key={project.id} project={project} stage="visualization"
                    onAction={(p) => { setSelectedProject(p); setIsModalOpen(true); }}
                    actionLabel="Complete 3D Visualization →" index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <GenericActionModal project={selectedProject} isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
        title="Complete 3D Visualization"
        description="Mark 3D models and renders delivered. Project will route to Accounts for invoicing."
        actionLabel="Complete Visualization" onConfirm={completeVisualization} variant="success" accentColor="indigo" />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
        <Box className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No pending visualization tasks</p>
      <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">You're all caught up!</p>
    </motion.div>
  );
}
