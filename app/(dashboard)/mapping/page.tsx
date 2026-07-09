'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers, Activity, BarChart2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { GenericActionModal } from '@/components/dashboard/ActionModal';
import { Project } from '@/types';
import { applyFilters } from '@/lib/utils';

export default function MappingPage() {
  const { projects, searchQuery, dateFilter, completeMapping } = useProjectStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allTouched = projects.filter((p) =>
    p.stages.mapping.status !== 'pending' && p.stages.mapping.status !== 'bypassed'
  );
  const pending = allTouched.filter((p) => p.stages.mapping.status === 'in_progress').length;

  const displayed = useMemo(
    () => applyFilters(projects, 'mapping', 'in_progress', searchQuery, dateFilter, true, true),
    [projects, searchQuery, dateFilter],
  );

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Mapping" subtitle="Topographic & site mapping — sorted by scheduled date" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
              Pending Tasks
            </h2>
          </div>
          {displayed.length === 0
            ? <EmptyState />
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {displayed.map((project, i) => (
                    <ProjectCard key={project.id} project={project} stage="mapping"
                      onAction={(p) => { setSelectedProject(p); setIsModalOpen(true); }}
                      actionLabel="Complete Mapping →" index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
        </div>
      </div>

      <GenericActionModal project={selectedProject} isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
        title="Complete Mapping"
        description="Mark mapping complete. For Marking workflow: if Survey is also complete → routes to Accounts. For Mapping workflow → routes to Accounts directly."
        actionLabel="Complete Mapping" onConfirm={completeMapping} variant="success" accentColor="emerald" />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
        <Layers className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No pending mapping tasks</p>
      <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">You're all caught up!</p>
    </motion.div>
  );
}
