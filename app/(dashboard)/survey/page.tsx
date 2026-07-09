'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Map, Activity, BarChart2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { ReachedLocationModal, SurveyActionModal } from '@/components/dashboard/ActionModal';
import { Project } from '@/types';
import { applyFilters } from '@/lib/utils';

export default function SurveyPage() {
  const { projects, searchQuery, dateFilter } = useProjectStore();

  const [reachProject,    setReachProject]   = useState<Project | null>(null);
  const [completeProject, setCompleteProject] = useState<Project | null>(null);
  const [isReachOpen,     setIsReachOpen]     = useState(false);
  const [isCompleteOpen,  setIsCompleteOpen]  = useState(false);

  const allTouched = projects.filter((p) =>
    p.stages.survey.status !== 'pending' && p.stages.survey.status !== 'bypassed'
  );
  const pending = allTouched.filter((p) => p.stages.survey.status === 'in_progress').length;

  // Only show pending — completed hidden; sorted by nearest scheduledDate
  const displayed = useMemo(
    () => applyFilters(projects, 'survey', 'in_progress', searchQuery, dateFilter, true, true),
    [projects, searchQuery, dateFilter],
  );

  const handleSurveyAction = (project: Project) => {
    if (!project.stages.survey.reachedAt) {
      setReachProject(project); setIsReachOpen(true);
    } else {
      setCompleteProject(project); setIsCompleteOpen(true);
    }
  };

  const getSurveyLabel = (project: Project): string | null => {
    if (project.stages.survey.status !== 'in_progress') return null;
    return project.stages.survey.reachedAt ? 'Complete Survey →' : 'Mark Reached Location →';
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Survey" subtitle="Field survey assignments — sorted by scheduled date" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
              Pending Surveys
            </h2>
          </div>
          {displayed.length === 0
            ? <EmptyState />
            : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <AnimatePresence mode="popLayout">
                  {displayed.map((project, i) => (
                    <ProjectCard key={project.id} project={project} stage="survey"
                      onAction={handleSurveyAction} actionLabel={getSurveyLabel} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            )}
        </div>
      </div>

      <ReachedLocationModal project={reachProject} isOpen={isReachOpen}
        onClose={() => { setIsReachOpen(false); setReachProject(null); }} />
      <SurveyActionModal project={completeProject} isOpen={isCompleteOpen}
        onClose={() => { setIsCompleteOpen(false); setCompleteProject(null); }} />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
        <Map className="w-6 h-6 text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No pending surveys</p>
      <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">You're all caught up!</p>
    </motion.div>
  );
}
