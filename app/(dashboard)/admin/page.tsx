'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Map, BarChart3, Activity, MapPin, Building2, Clock, PlusCircle } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { ProjectTimeline } from '@/components/dashboard/ProjectTimeline';
import { PriorityBadge } from '@/components/ui/Badge';
import { AddLeadModal } from '@/components/dashboard/AddLeadModal';
import { formatDate, applyAdminFilters } from '@/lib/utils';
import { Project } from '@/types';

export default function AdminPage() {
  const { getAllProjects, searchQuery, dateFilter } = useProjectStore();
  const allProjects = getAllProjects();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const projects = useMemo(
    () => applyAdminFilters(allProjects, searchQuery, dateFilter),
    [allProjects, searchQuery, dateFilter],
  );

  const stats = useMemo(() => {
    const byStage  = (stage: string) => allProjects.filter((p) => p.currentStage === stage).length;
    const completed = allProjects.filter((p) =>
      Object.values(p.stages).every((s) => s.status === 'completed' || s.status === 'bypassed')
    ).length;

    return [
      { label: 'Total Projects',  value: allProjects.length,   icon: <BarChart3 className="w-5 h-5 text-violet-500 dark:text-violet-400" />, color: 'bg-violet-500/10' },
      { label: 'In Sales',        value: byStage('sales'),     icon: <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />, color: 'bg-blue-500/10' },
      { label: 'In Survey',       value: byStage('survey'),    icon: <Map className="w-5 h-5 text-amber-500 dark:text-amber-400" />, color: 'bg-amber-500/10' },
      { label: 'Closed',          value: completed,             icon: <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />, color: 'bg-emerald-500/10', change: `${Math.round((completed / Math.max(allProjects.length, 1)) * 100)}% rate`, changeType: 'neutral' as const },
    ];
  }, [allProjects]);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Admin Dashboard" subtitle="Full pipeline oversight across all departments" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        <StatsRow stats={stats} />

        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/50 dark:border-white/5">
            <div>
              <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">All Projects — Pipeline View</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{projects.length} of {allProjects.length} projects</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <Clock className="w-3.5 h-3.5" /> Live
              </div>
              {/* Add Lead — Admin has access */}
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-all duration-150 hover:-translate-y-0.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Lead
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <AnimatePresence>
              {projects.map((project, i) => <AdminProjectRow key={project.id} project={project} index={i} />)}
            </AnimatePresence>
            {projects.length === 0 && (
              <div className="px-5 py-12 text-center text-slate-400 dark:text-slate-600 text-sm">
                No projects match the current search / date filter.
              </div>
            )}
          </div>
        </div>
      </div>

      <AddLeadModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}

function AdminProjectRow({ project, index }: { project: Project; index: number }) {
  const stageColors: Record<string, string> = {
    sales:    'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    survey:   'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    mapping:  'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    drafting: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20',
    accounts: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
  };

  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}
      className="px-5 py-3.5 hover:bg-slate-50/70 dark:hover:bg-white/3 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{project.id}</span>
            <PriorityBadge priority={project.priority} />
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${stageColors[project.currentStage]}`}>
              {project.currentStage.charAt(0).toUpperCase() + project.currentStage.slice(1)}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">{project.name}</h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Building2 className="w-3 h-3" />{project.client}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <MapPin className="w-3 h-3" />{project.location.split(',')[0]}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(project.createdAt)}</p>
          {project.deadline && <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Due {formatDate(project.deadline)}</p>}
        </div>
      </div>
      <ProjectTimeline project={project} />
    </motion.div>
  );
}
