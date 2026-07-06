'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, AlertTriangle, CheckCircle2, RotateCcw, Clock, Building2, MapPin } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { AdminCancelReviewModal, RescheduleModal } from '@/components/dashboard/ActionModal';
import { formatDate, sortByNearestDate } from '@/lib/utils';
import { PipelineStage, Project } from '@/types';

const DEPT_STAGES: PipelineStage[] = ['sales', 'survey', 'mapping', 'drawing', 'visualization', 'accounts'];
const STAGE_LABEL: Record<string, string> = { sales: 'Sales', survey: 'Survey', mapping: 'Mapping', drawing: 'Drawing', visualization: '3D Viz', accounts: 'Accounts' };

type Tab = 'requests' | 'cancelled';

export default function AdminCancelledPage() {
  const { getAllProjects } = useProjectStore();
  const allProjects = getAllProjects();
  const [activeTab, setActiveTab] = useState<Tab>('requests');

  // Pending cancellation requests (need admin action)
  const pendingRequests = useMemo(() =>
    sortByNearestDate(allProjects.filter((p) =>
      DEPT_STAGES.some((s) => p.stages[s].status === 'cancellation_requested')
    )),
    [allProjects]
  );

  // Already cancelled projects
  const cancelledProjects = useMemo(() =>
    sortByNearestDate(allProjects.filter((p) =>
      DEPT_STAGES.some((s) => p.stages[s].status === 'cancelled') &&
      !DEPT_STAGES.some((s) => p.stages[s].status === 'cancellation_requested')
    )),
    [allProjects]
  );

  const tabs: { id: Tab; label: string; count: number; color: string; activeColor: string }[] = [
    { id: 'requests', label: '⚠ Pending Requests', count: pendingRequests.length, color: 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400', activeColor: 'border-orange-400 bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300' },
    { id: 'cancelled', label: '✖ Cancelled Projects', count: cancelledProjects.length, color: 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400', activeColor: 'border-red-400 bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Cancelled & Rescheduled" subtitle="Review cancellation requests and manage cancelled projects" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                activeTab === tab.id ? tab.activeColor : tab.color + ' hover:bg-slate-50 dark:hover:bg-white/5'
              }`}>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-white/30 dark:bg-black/20' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Pending Requests ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'requests' && (
            <motion.div key="requests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-3">
              {pendingRequests.length === 0 ? (
                <EmptyState icon={<AlertTriangle />} message="No pending requests" sub="All cancellation requests have been handled." />
              ) : (
                pendingRequests.map((project, i) => {
                  const reqStage = DEPT_STAGES.find((s) => project.stages[s].status === 'cancellation_requested')!;
                  return <CancelRequestCard key={project.id} project={project} stage={reqStage} index={i} />;
                })
              )}
            </motion.div>
          )}

          {/* ── Cancelled Projects ────────────────────────────────────────── */}
          {activeTab === 'cancelled' && (
            <motion.div key="cancelled" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="space-y-3">
              {cancelledProjects.length === 0 ? (
                <EmptyState icon={<XCircle />} message="No cancelled projects" sub="Approved cancellations will appear here." />
              ) : (
                cancelledProjects.map((project, i) => {
                  const cancelStage = DEPT_STAGES.find((s) => project.stages[s].status === 'cancelled')!;
                  return <CancelledProjectCard key={project.id} project={project} stage={cancelStage} index={i} />;
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Cancellation Request Card (admin reviews, can approve or reassign) ─────────

function CancelRequestCard({ project, stage, index }: { project: Project; stage: PipelineStage; index: number }) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const record = project.stages[stage];
  const displayDate = project.scheduledDate ?? project.deadline;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className="glass rounded-2xl overflow-hidden border border-orange-200/60 dark:border-orange-500/20">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 bg-orange-50/80 dark:bg-orange-500/10 border-b border-orange-200/50 dark:border-orange-500/15">
        <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-orange-700 dark:text-orange-300">Cancellation Request — {STAGE_LABEL[stage]}</p>
          <p className="text-[11px] text-orange-600/70 dark:text-orange-400/70">Submitted by worker · Awaiting admin action</p>
        </div>
        <Clock className="w-3.5 h-3.5 text-orange-400" />
      </div>

      {/* Content */}
      <div className="px-5 py-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{project.id}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{project.name}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{project.client}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location.split(',')[0]}</span>
            </div>
            {/* Reason */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
              <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Worker's Reason</p>
              <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed italic">"{record.cancelReason}"</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 space-y-1">
            {displayDate && <p className="text-xs text-amber-600 dark:text-amber-400">⏰ {formatDate(displayDate)}</p>}
          </div>
        </div>

        {/* Admin actions */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setIsReviewOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all hover:-translate-y-0.5">
            Review & Decide →
          </button>
        </div>
      </div>

      <AdminCancelReviewModal project={project} stage={stage} isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
    </motion.div>
  );
}

// ── Cancelled Project Card (already approved, can reschedule) ──────────────────

function CancelledProjectCard({ project, stage, index }: { project: Project; stage: PipelineStage; index: number }) {
  const [isReschedOpen, setIsReschedOpen] = useState(false);
  const record = project.stages[stage];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className="glass rounded-2xl overflow-hidden border border-red-200/50 dark:border-red-500/20">
      <div className="flex items-center gap-3 px-5 py-2.5 bg-red-50/60 dark:bg-red-500/10 border-b border-red-200/40 dark:border-red-500/15">
        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p className="text-xs font-bold text-red-700 dark:text-red-300">Cancelled — {STAGE_LABEL[stage]}</p>
      </div>
      <div className="px-5 py-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">{project.id}</span>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mt-1">{project.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
              <span>{project.client}</span>
            </div>
            {record.cancelReason && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 italic">↪ {record.cancelReason}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setIsReschedOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all hover:-translate-y-0.5">
            <RotateCcw className="w-3 h-3" /> Reschedule
          </button>
        </div>
      </div>
      <RescheduleModal project={project} stage={stage} isOpen={isReschedOpen} onClose={() => setIsReschedOpen(false)} />
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 glass rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 [&>svg]:w-6 [&>svg]:h-6 [&>svg]:text-slate-300 dark:[&>svg]:text-slate-600">{icon}</div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{message}</p>
      <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">{sub}</p>
    </motion.div>
  );
}
