'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/store/useProjectStore';
import { NewLead, WorkflowType } from '@/types';
import { PlusCircle, Building2, Phone, MapPin, Calendar, Layers, IndianRupee, Info, GitBranch } from 'lucide-react';

const PREDEFINED_TYPES = [
  'Road Construction', 'Bridge Engineering', 'Drainage System', 'Structural Audit',
  'Land Survey', 'Residential Layout', 'Commercial Development', 'Water Treatment',
  'Highway Expansion', 'Flyover Design', 'Boundary Survey',
];

const WORKFLOW_OPTIONS: { value: WorkflowType; label: string; description: string }[] = [
  { value: 'survey_only',   label: '🗺️ Survey (No Mapping)', description: 'Survey → Accounts' },
  { value: 'survey_mapping',label: '🗺️ Survey + Mapping',   description: 'Survey → Mapping → Accounts' },
  { value: 'marking',       label: '📍 Marking',          description: 'Survey + Mapping notified simultaneously → Accounts' },
  { value: 'drawing',       label: '✏️ Drawing',          description: 'Technical drawings / CAD → Accounts' },
  { value: 'visualization', label: '🏗️ 3D Visualization', description: '3D models & renders → Accounts' },
];

// Shared select class (dark mode compatible)
const SELECT_CLS = [
  'w-full h-10 !pl-10 pr-4 rounded-xl border text-sm appearance-none',
  'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
  'border-slate-200 dark:border-white/10',
  'hover:border-slate-300 dark:hover:border-white/20',
  'focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all',
].join(' ');

const SELECT_ERROR_CLS = SELECT_CLS.replace('border-slate-200 dark:border-white/10', 'border-red-400 dark:border-red-500/70');

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const { addLead } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Partial<NewLead> & { customType?: string }>({});
  const [selectedType, setSelectedType] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isOther = selectedType === 'Other';
  const isFieldWorkflow = selectedWorkflow === 'marking' || selectedWorkflow === 'mapping';
  const isDeadlineWorkflow = selectedWorkflow === 'drawing' || selectedWorkflow === 'visualization';

  const setField = (key: keyof (NewLead & { customType: string }), val: string | number) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim())        e.name          = 'Project name is required';
    if (!form.client?.trim())      e.client        = 'Client name is required';
    if (!form.clientPhone?.trim() || form.clientPhone.trim().length < 10)
                                   e.clientPhone   = 'Valid phone number required (min 10 digits)';
    if (!form.location?.trim())    e.location      = 'Location is required';
    if (!selectedType)             e.type          = 'Project type is required';
    if (isOther && !form.customType?.trim()) e.customType = 'Please specify the project type';
    if (!selectedWorkflow)         e.workflowType  = 'Workflow type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const effectiveType = isOther ? (form.customType?.trim() ?? 'Other') : selectedType;
    addLead({ ...(form as NewLead), type: effectiveType, workflowType: selectedWorkflow as WorkflowType });
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setForm({});
    setSelectedType('');
    setSelectedWorkflow('');
    setErrors({});
  };

  const wfInfo = WORKFLOW_OPTIONS.find((w) => w.value === selectedWorkflow);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Lead" description="Fill in the project and workflow details">
      <div className="space-y-4">

        {/* Project Name */}
        <Field label="Project Name" required error={errors.name}>
          <InputRow icon={<Layers className="w-3.5 h-3.5" />} placeholder="e.g. NH-48 Highway Widening"
            value={form.name ?? ''} onChange={(v) => setField('name', v)} hasError={!!errors.name} />
        </Field>

        {/* Client */}
        <Field label="Client / Company Name" required error={errors.client}>
          <InputRow icon={<Building2 className="w-3.5 h-3.5" />} placeholder="e.g. Karnataka PWD"
            value={form.client ?? ''} onChange={(v) => setField('client', v)} hasError={!!errors.client} />
        </Field>

        {/* Phone */}
        <Field label="Client Phone Number" required error={errors.clientPhone}>
          <InputRow icon={<Phone className="w-3.5 h-3.5" />} placeholder="+91 98765 43210" type="tel"
            value={form.clientPhone ?? ''} onChange={(v) => setField('clientPhone', v)} hasError={!!errors.clientPhone} />
        </Field>

        {/* Location */}
        <Field label="Location / Address" required error={errors.location}>
          <InputRow icon={<MapPin className="w-3.5 h-3.5" />} placeholder="Address or paste Google Maps link"
            value={form.location ?? ''} onChange={(v) => setField('location', v)} hasError={!!errors.location} />
        </Field>

        {/* Amount */}
        <Field label="Project Amount (₹)">
          <InputRow icon={<IndianRupee className="w-3.5 h-3.5" />} placeholder="e.g. 500000" type="number"
            value={form.value !== undefined ? String(form.value) : ''}
            onChange={(v) => setField('value', v === '' ? 0 : Number(v))} />
        </Field>

        {/* Project Type */}
        <Field label="Project Type" required error={errors.type || errors.customType}>
          <div className="relative">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
            <select value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setErrors((p) => { const n = {...p}; delete n.type; delete n.customType; return n; }); }}
              className={errors.type ? SELECT_ERROR_CLS : SELECT_CLS}>
              <option value="">Select project type…</option>
              {PREDEFINED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              <option value="Other">Other (specify below)</option>
            </select>
          </div>
          {isOther && (
            <div className="mt-2">
              <InputRow icon={<Layers className="w-3.5 h-3.5" />} placeholder="Describe the project type"
                value={form.customType ?? ''} onChange={(v) => setField('customType', v)} hasError={!!errors.customType} />
            </div>
          )}
        </Field>

        {/* Workflow Type */}
        <Field label="Designated Department" required error={errors.workflowType}>
          <div className="relative">
            <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
            <select value={selectedWorkflow}
              onChange={(e) => { setSelectedWorkflow(e.target.value as WorkflowType); setErrors((p) => { const n = {...p}; delete n.workflowType; return n; }); }}
              className={errors.workflowType ? SELECT_ERROR_CLS : SELECT_CLS}>
              <option value="">Select workflow…</option>
              {WORKFLOW_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
          {wfInfo && (
            <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Flow: Sales → {wfInfo.description}</span>
            </div>
          )}
        </Field>

        {/* Scheduled Date (field visit) — for marking/mapping workflows */}
        {isFieldWorkflow && (
          <Field label="Scheduled Field-Visit Date" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
              <input type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                value={form.scheduledDate ? form.scheduledDate.slice(0, 16) : ''}
                onChange={(e) => setField('scheduledDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className={`w-full h-10 !pl-10 pr-4 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all`} />
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> This is a specific site-visit date, not a deadline.
            </p>
          </Field>
        )}

        {/* Deadline — for drawing/visualization workflows */}
        {isDeadlineWorkflow && (
          <Field label="Project Deadline">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
              <input type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.deadline?.split('T')[0] ?? ''}
                onChange={(e) => setField('deadline', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full h-10 !pl-10 pr-4 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
            </div>
          </Field>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="md" className="flex-1" isLoading={isLoading}
            icon={<PlusCircle className="w-4 h-4" />} onClick={handleSubmit}>
            Create Lead
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}

function InputRow({ icon, placeholder, type = 'text', value, onChange, hasError }: {
  icon: React.ReactNode; placeholder: string; type?: string; value: string;
  onChange: (v: string) => void; hasError?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10 flex items-center">{icon}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full h-10 !pl-10 pr-4 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
          hasError ? 'border-red-400 dark:border-red-500/70 ring-2 ring-red-400/20' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }`} />
    </div>
  );
}
