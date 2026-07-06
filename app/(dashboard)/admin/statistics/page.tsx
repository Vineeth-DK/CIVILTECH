'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, CheckCircle2, XCircle, Clock, IndianRupee,
  Map, Layers, PenTool, Box, DollarSign, AlertTriangle, Zap, Download,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Topbar } from '@/components/dashboard/Topbar';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { PipelineStage, DateFilter } from '@/types';

const DEPT_META: { stage: PipelineStage; label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }[] = [
  { stage: 'sales',         label: 'Sales',            icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-500/10' },
  { stage: 'survey',        label: 'Survey',           icon: Map,        color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500/10' },
  { stage: 'mapping',       label: 'Mapping',          icon: Layers,     color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { stage: 'drawing',       label: 'Drawing',          icon: PenTool,    color: 'text-pink-600 dark:text-pink-400',    bg: 'bg-pink-500/10' },
  { stage: 'visualization', label: '3D Visualization', icon: Box,        color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
  { stage: 'accounts',      label: 'Accounts',         icon: DollarSign, color: 'text-sky-600 dark:text-sky-400',      bg: 'bg-sky-500/10' },
];

export default function AdminStatisticsPage() {
  const { getAllProjects, dateFilter } = useProjectStore();
  const allProjects = getAllProjects();

  // Date cutoff based on selected period
  const cutoff = useMemo(() => {
    if (dateFilter === 'all') return new Date(0);
    const d = new Date();
    if (dateFilter === 'today') d.setHours(0, 0, 0, 0);
    if (dateFilter === 'week')  d.setDate(d.getDate() - 7);
    if (dateFilter === 'month') d.setMonth(d.getMonth() - 1);
    if (dateFilter === 'year')  d.setFullYear(d.getFullYear() - 1);
    return d;
  }, [dateFilter]);

  const filtered = allProjects.filter((p) => {
    const d = p.scheduledDate ?? p.deadline ?? p.createdAt;
    return new Date(d) >= cutoff;
  });

  const totalRevenue = filtered.reduce((sum, p) => sum + (p.value ?? 0), 0);
  const completed    = filtered.filter((p) => Object.values(p.stages).every((s) => s.status === 'completed' || s.status === 'bypassed'));
  const cancelled    = filtered.filter((p) => Object.values(p.stages).some((s) => s.status === 'cancelled'));
  const pending      = filtered.filter((p) => Object.values(p.stages).some((s) => s.status === 'in_progress'));
  const completionRate = filtered.length > 0 ? Math.round((completed.length / filtered.length) * 100) : 0;
  const cancellationRate = filtered.length > 0 ? Math.round((cancelled.length / filtered.length) * 100) : 0;

  // Dept stats
  const deptStats = DEPT_META.map(({ stage, label, icon, color, bg }) => {
    const touched   = filtered.filter((p) => p.stages[stage].status !== 'pending' && p.stages[stage].status !== 'bypassed');
    const doneCount = touched.filter((p) => p.stages[stage].status === 'completed').length;
    const inProgress = touched.filter((p) => p.stages[stage].status === 'in_progress').length;
    const cancelledD = touched.filter((p) => p.stages[stage].status === 'cancelled' || p.stages[stage].status === 'cancellation_requested').length;
    const rate = touched.length > 0 ? Math.round((doneCount / touched.length) * 100) : 0;
    return { stage, label, icon, color, bg, total: touched.length, done: doneCount, inProgress, cancelled: cancelledD, rate };
  });

  // Workflow breakdown
  const wfBreakdown = ['marking', 'mapping', 'drawing', 'visualization'].map((wf) => ({
    label: { marking: '📍 Marking', mapping: '🗺️ Mapping', drawing: '✏️ Drawing', visualization: '🏗️ 3D Viz' }[wf] ?? wf,
    count: filtered.filter((p) => p.workflowType === wf).length,
  })).filter((w) => w.count > 0);

  const maxWfCount = Math.max(...wfBreakdown.map((w) => w.count), 1);



  const handleExport = () => {
    const header = ['ID', 'Name', 'Client', 'Type', 'Workflow', 'Current Stage', 'Value (INR)', 'Created At', 'Scheduled Date/Deadline', 'Status'];
    const rows = filtered.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.client.replace(/"/g, '""')}"`,
      `"${p.type.replace(/"/g, '""')}"`,
      p.workflowType,
      p.currentStage,
      p.value,
      new Date(p.createdAt).toLocaleDateString(),
      p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : p.deadline ? new Date(p.deadline).toLocaleDateString() : '',
      p.stages[p.currentStage]?.status ?? 'unknown'
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivilTech_Export_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Statistics" subtitle="Department & project performance analytics" />
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">

        {/* ── Export ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end">
          <Button variant="primary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export to Excel
          </Button>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Projects',  value: filtered.length, icon: <BarChart2 className="w-5 h-5" />,      color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { label: 'Revenue',          value: formatCurrency(totalRevenue), icon: <IndianRupee className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10', raw: true },
            { label: 'Completed',        value: completed.length, icon: <CheckCircle2 className="w-5 h-5" />,  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Cancelled',        value: cancelled.length, icon: <XCircle className="w-5 h-5" />,       color: 'text-red-500',     bg: 'bg-red-500/10' },
          ].map((kpi) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-4 flex flex-col gap-2">
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>{kpi.icon}</div>
              <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{kpi.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Rates ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <RateCard label="Completion Rate" rate={completionRate} color="emerald" icon={<CheckCircle2 />} />
          <RateCard label="Cancellation Rate" rate={cancellationRate} color="red" icon={<XCircle />} />
          <RateCard label="Active Projects" rate={filtered.length > 0 ? Math.round((pending.length / filtered.length) * 100) : 0} color="blue" icon={<Zap />} />
        </div>

        {/* ── Dept Performance ──────────────────────────────────────────────── */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/5">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">Department Performance</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Completion rates across all departments</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {deptStats.map(({ stage, label, icon: Icon, color, bg, total, done, inProgress, cancelled: cancelledD, rate }) => (
              <div key={stage} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{total} received · {done} done · {inProgress} in progress</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{rate}%</p>
                    {cancelledD > 0 && (
                      <p className="text-[11px] text-red-500 dark:text-red-400 flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3 h-3" />{cancelledD} cancelled
                      </p>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${rate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    className={`h-full rounded-full ${
                      rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-blue-500' : rate >= 20 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Workflow Breakdown ────────────────────────────────────────────── */}
        {wfBreakdown.length > 0 && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/5">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">Project Type Distribution</h2>
            </div>
            <div className="p-5 space-y-3">
              {wfBreakdown.map(({ label, count }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{count}</p>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${(count / maxWfCount) * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Pipeline Stage Counts ─────────────────────────────────────────── */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200/50 dark:border-white/5">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white text-sm">Current Stage Distribution</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Where projects are right now (active projects only)</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-slate-100 dark:divide-white/5">
            {DEPT_META.map(({ stage, label, icon: Icon, color, bg }) => {
              const atStage = allProjects.filter((p) => p.currentStage === stage && Object.values(p.stages).some((s) => s.status === 'in_progress')).length;
              return (
                <div key={stage} className="flex flex-col items-center justify-center py-4 px-2 text-center">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{atStage}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{label}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Rate Card ─────────────────────────────────────────────────────────────────

function RateCard({ label, rate, color, icon }: { label: string; rate: number; color: 'emerald' | 'red' | 'blue'; icon: React.ReactNode }) {
  const colorMap = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    red:     'text-red-600 dark:text-red-400 bg-red-500/10',
    blue:    'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  };
  const barColor = { emerald: 'bg-emerald-500', red: 'bg-red-500', blue: 'bg-blue-500' };

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorMap[color]} [&>svg]:w-4 [&>svg]:h-4`}>{icon}</div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      </div>
      <p className={`text-3xl font-bold font-display ${colorMap[color].split(' ').slice(0, 2).join(' ')}`}>{rate}%</p>
      <div className="w-full h-2 bg-slate-100 dark:bg-white/8 rounded-full mt-2 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor[color]}`} />
      </div>
    </div>
  );
}
