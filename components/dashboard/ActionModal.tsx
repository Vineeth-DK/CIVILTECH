'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Project, LeadDetails, PipelineStage } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';
import {
  CheckCircle, GitBranch, Navigation, Phone, AlertTriangle,
  XCircle, CalendarClock, RotateCcw, Send, ArrowRightLeft, Trash2,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

const PIPELINE_STAGES: { value: PipelineStage; label: string }[] = [
  { value: 'sales',         label: 'Sales' },
  { value: 'survey',        label: 'Survey' },
  { value: 'mapping',       label: 'Mapping' },
  { value: 'drawing',       label: 'Drawing' },
  { value: 'visualization', label: '3D Visualization' },
  { value: 'accounts',      label: 'Accounts' },
];

const SELECT_CLS = [
  'w-full h-10 pl-3 pr-4 rounded-xl border text-sm appearance-none',
  'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
  'border-slate-200 dark:border-white/10',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all',
].join(' ');

// ─── Sales Action Modal ────────────────────────────────────────────────────────

export function SalesActionModal({ project, isOpen, onClose }: {
  project: Project | null; isOpen: boolean; onClose: () => void;
}) {
  const [clientPhone, setClientPhone] = useState(project?.clientPhone ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const { confirmLead } = useProjectStore();

  const wfLabel: Record<string, string> = {
    marking:       '📍 Marking — Survey + Mapping simultaneously → Accounts',
    mapping:       '🗺️ Mapping — Survey → Mapping → Accounts',
    drawing:       '✏️ Drawing → Accounts',
    visualization: '🏗️ 3D Visualization → Accounts',
  };

  const handleConfirm = async () => {
    if (!project || clientPhone.trim().length < 10) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    confirmLead(project.id, { clientPhone: clientPhone.trim() } as LeadDetails);
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => { onClose(); setClientPhone(''); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Lead" description={project?.name ?? ''}>
      <div className="space-y-4">
        {project && (
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <GitBranch className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Workflow</p>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">{wfLabel[project.workflowType]}</p>
            {project.scheduledDate && <p className="text-xs text-blue-500 mt-1">📅 Scheduled: {formatDate(project.scheduledDate)}</p>}
            {project.deadline && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⏰ Deadline: {formatDate(project.deadline)}</p>}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Client Mobile <span className="text-red-400">*</span></label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full h-10 !pl-10 pr-4 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20" />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="md" className="flex-1" disabled={clientPhone.trim().length < 10} isLoading={isLoading} icon={<CheckCircle className="w-4 h-4" />} onClick={handleConfirm}>Confirm Lead</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Survey: Step 1 — Mark Reached ────────────────────────────────────────────

export function ReachedLocationModal({ project, isOpen, onClose }: {
  project: Project | null; isOpen: boolean; onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { markReachedLocation } = useProjectStore();

  const handleConfirm = async () => {
    if (!project) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    markReachedLocation(project.id);
    setIsLoading(false);
    onClose();
  };

  const location = project?.location ?? '';
  const isMapLink = location.startsWith('http');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Site Arrival" description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Navigation className="w-4 h-4 text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Step 1 of 2 — Site Arrival</p>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Confirm field team has reached the project site.</p>
        </div>
        {project?.scheduledDate && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" /> Scheduled: {formatDate(project.scheduledDate)}
          </div>
        )}
        {isMapLink && (
          <a href={location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
            <Navigation className="w-3.5 h-3.5" /> View on Maps
          </a>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" size="md" className="flex-1" isLoading={isLoading} icon={<Navigation className="w-4 h-4" />} onClick={handleConfirm}>Confirm Reached</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Survey: Step 2 — Complete ────────────────────────────────────────────────

export function SurveyActionModal({ project, isOpen, onClose }: {
  project: Project | null; isOpen: boolean; onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [mappingRequired, setMappingRequired] = useState(true);
  const { completeSurvey } = useProjectStore();

  const handleConfirm = async () => {
    if (!project) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    completeSurvey(project.id, mappingRequired);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Survey" description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-300 mb-0.5">Step 2 of 2 — Mark Complete</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">Survey complete.</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Is Mapping Required?</label>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-slate-200 dark:border-white/10"
                   style={mappingRequired ? { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.05)' } : {}}>
              <input type="radio" checked={mappingRequired} onChange={() => setMappingRequired(true)} className="hidden" />
              <span className={`text-sm font-medium ${mappingRequired ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>Yes, send to Mapping</span>
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-slate-200 dark:border-white/10"
                   style={!mappingRequired ? { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)' } : {}}>
              <input type="radio" checked={!mappingRequired} onChange={() => setMappingRequired(false)} className="hidden" />
              <span className={`text-sm font-medium ${!mappingRequired ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>No, bypass to Accounts</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" size="md" className="flex-1" isLoading={isLoading} icon={<CheckCircle className="w-4 h-4" />} onClick={handleConfirm}>Complete Survey</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Generic Confirm Modal ────────────────────────────────────────────────────

export function GenericActionModal({ project, isOpen, onClose, title, description, actionLabel, onConfirm, variant = 'primary', accentColor = 'blue' }: {
  project: Project | null; isOpen: boolean; onClose: () => void;
  title: string; description: string; actionLabel: string;
  onConfirm: (projectId: string) => void;
  variant?: 'primary' | 'success' | 'danger';
  accentColor?: 'blue' | 'emerald' | 'pink' | 'sky' | 'indigo' | 'fuchsia';
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!project) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onConfirm(project.id);
    setIsLoading(false);
    onClose();
  };

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300',
    emerald:'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    pink:   'bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20 text-pink-700 dark:text-pink-300',
    sky:    'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    fuchsia:'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-200 dark:border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className={cn('p-2.5 rounded-xl border text-xs leading-relaxed', colorMap[accentColor])}>{description}</div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant={variant} size="md" className="flex-1" isLoading={isLoading} icon={<CheckCircle className="w-4 h-4" />} onClick={handleConfirm}>{actionLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Cancel Modal — worker submits request, admin reviews it ──────────────────

export function CancelModal({ project, stage, isOpen, onClose }: {
  project: Project | null; stage: PipelineStage; isOpen: boolean; onClose: () => void;
}) {
  const [reason, setReason]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { requestCancellation } = useProjectStore();

  const handleConfirm = async () => {
    if (!project || reason.trim().length < 10) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    requestCancellation(project.id, stage, reason.trim());
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => { onClose(); setReason(''); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Cancellation" description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-xs text-orange-700 dark:text-orange-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Your cancellation request will be sent to <strong>Admin</strong> for review. They can approve it or reassign the project to a different department.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Reason for Cancellation <span className="text-red-400">*</span>
          </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="Please describe why this task needs to be cancelled or postponed (min 10 chars)…"
            className="w-full px-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-white/5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400/40 resize-none transition-all" />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{reason.trim().length}/10 min characters</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>Go Back</Button>
          <Button variant="danger" size="md" className="flex-1" disabled={reason.trim().length < 10} isLoading={isLoading}
            icon={<Send className="w-4 h-4" />} onClick={handleConfirm}>
            Submit Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Revert Modal — worker sends project back to previous completed stage ──────

export function RevertModal({ project, stage, isOpen, onClose }: {
  project: Project | null; stage: PipelineStage; isOpen: boolean; onClose: () => void;
}) {
  const [reason, setReason]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { revertProject } = useProjectStore();

  const handleConfirm = async () => {
    if (!project || reason.trim().length < 10) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    revertProject(project.id, stage, reason.trim());
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => { onClose(); setReason(''); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Revert to Previous Dept" description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>The project will be sent <strong>backwards</strong> to the last completed department so they can resolve the issue.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Reason for Reverting <span className="text-red-400">*</span>
          </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="Describe the issue that needs to be fixed (min 10 chars)…"
            className="w-full px-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-white/5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-none transition-all" />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{reason.trim().length}/10 min characters</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>Go Back</Button>
          <Button variant="primary" size="md" className="flex-1" disabled={reason.trim().length < 10} isLoading={isLoading}
            icon={<ArrowRightLeft className="w-4 h-4" />} onClick={handleConfirm}>
            Revert Project
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Admin Cancel Review Modal — approve or reassign ─────────────────────────

export function AdminCancelReviewModal({ project, stage, isOpen, onClose }: {
  project: Project | null; stage: PipelineStage; isOpen: boolean; onClose: () => void;
}) {
  const [mode, setMode]           = useState<'approve' | 'reassign'>('approve');
  const [toStage, setToStage]     = useState<PipelineStage>('sales');
  const [newDate, setNewDate]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { approveCancellation, reassignProject } = useProjectStore();

  const stageRecord = project?.stages[stage];
  const isFieldTarget = toStage === 'survey' || toStage === 'mapping';

  const handleSubmit = async () => {
    if (!project) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (mode === 'approve') {
      approveCancellation(project.id, stage);
    } else {
      reassignProject(project.id, stage, toStage, newDate || undefined);
    }
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => { onClose(); setMode('approve'); setToStage('sales'); setNewDate(''); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Review Cancellation Request" description={project?.name ?? ''}>
      <div className="space-y-4">
        {/* Reason */}
        {stageRecord?.cancelReason && (
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
            <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">Worker's Reason</p>
            <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">{stageRecord.cancelReason}</p>
          </div>
        )}

        {/* Mode toggle */}
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Admin Decision</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode('approve')} className={cn(
              'p-2.5 rounded-xl border text-left transition-all',
              mode === 'approve' ? 'border-red-400 bg-red-50 dark:bg-red-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 hover:bg-slate-50 dark:hover:bg-white/8'
            )}>
              <p className={cn('text-xs font-semibold', mode === 'approve' ? 'text-red-600 dark:text-red-300' : 'text-slate-600 dark:text-slate-300')}>✅ Approve Cancellation</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Mark as cancelled</p>
            </button>
            <button onClick={() => setMode('reassign')} className={cn(
              'p-2.5 rounded-xl border text-left transition-all',
              mode === 'reassign' ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 hover:bg-slate-50 dark:hover:bg-white/8'
            )}>
              <p className={cn('text-xs font-semibold', mode === 'reassign' ? 'text-blue-600 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300')}>🔀 Reassign to Dept</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Route to another team</p>
            </button>
          </div>
        </div>

        {/* Reassign options */}
        {mode === 'reassign' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assign To Department</label>
              <select value={toStage} onChange={(e) => setToStage(e.target.value as PipelineStage)} className={SELECT_CLS}>
                {PIPELINE_STAGES.filter((s) => s.value !== stage).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {isFieldTarget && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">New Scheduled Date</label>
                <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  className="w-full h-10 px-3 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button variant={mode === 'approve' ? 'danger' : 'primary'} size="md" className="flex-1" isLoading={isLoading}
            icon={mode === 'approve' ? <XCircle className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
            onClick={handleSubmit}>
            {mode === 'approve' ? 'Approve Cancellation' : 'Reassign Project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────

export function RescheduleModal({ project, stage, isOpen, onClose }: {
  project: Project | null; stage: PipelineStage; isOpen: boolean; onClose: () => void;
}) {
  const [newDate, setNewDate]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { rescheduleStage } = useProjectStore();
  const isFieldStage = stage === 'survey' || stage === 'mapping';

  const handleConfirm = async () => {
    if (!project) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    rescheduleStage(project.id, stage, newDate || undefined);
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => { onClose(); setNewDate(''); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reschedule Project" description={project?.name ?? ''}>
      <div className="space-y-4">
        {project?.stages?.[stage]?.cancelReason && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/8 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-semibold mb-0.5">Previous reason:</p>
            <p>{project.stages[stage].cancelReason}</p>
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {isFieldStage ? 'New Scheduled Field-Visit Date' : 'New Deadline'}
          </label>
          <div className="relative">
            <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
            <input type={isFieldStage ? 'datetime-local' : 'date'} value={newDate} onChange={(e) => setNewDate(e.target.value)}
              min={isFieldStage ? new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
              className="w-full h-10 !pl-10 pr-4 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="md" className="flex-1" isLoading={isLoading} icon={<RotateCcw className="w-4 h-4" />} onClick={handleConfirm}>Reschedule</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Delete Modal — admin permanently deletes a project ──────────────────────

export function DeleteModal({ project, isOpen, onClose }: {
  project: Project | null; isOpen: boolean; onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const { deleteProject } = useProjectStore();

  const handleConfirm = async () => {
    if (!project || confirmText !== 'DELETE') return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    deleteProject(project.id);
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => { onClose(); setConfirmText(''); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Permanently Delete Project" description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>This action is <strong>irreversible</strong>. The project and all its data will be permanently wiped from the system.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Type "DELETE" to confirm
          </label>
          <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full h-10 px-3 rounded-xl border text-sm font-mono tracking-widest uppercase bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="md" className="flex-1 !bg-red-500 hover:!bg-red-600 dark:!bg-red-600 dark:hover:!bg-red-700 !border-transparent text-white" disabled={confirmText !== 'DELETE'} isLoading={isLoading}
            icon={<Trash2 className="w-4 h-4" />} onClick={handleConfirm}>
            Delete Forever
          </Button>
        </div>
      </div>
    </Modal>
  );
}
