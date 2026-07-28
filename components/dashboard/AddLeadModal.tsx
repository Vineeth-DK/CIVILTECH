'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/store/useProjectStore';
import { NewLead, WorkflowType } from '@/types';
import { PlusCircle, Building2, Phone, MapPin, Calendar, Layers, IndianRupee, Info, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';

const PREDEFINED_TYPES = [
  'Boundary Survey', 'Topography Survey', 'Land Subdivision', 'DGPS Survey',
  'Total Station Survey', 'Drone Survey', 'Layout Marking', 'Total Station Marking',
  'Boundary Marking', 'Legal Documentation', 'Asbuilt Survey', 'Building Plan', '3D Elevations',
];

const LEAD_SOURCES = ['Website', 'Social Media', 'Referral', 'Walk-in', 'Other'];

const WORKFLOW_OPTIONS: { value: WorkflowType; label: string }[] = [
  { value: 'survey',        label: '🗺️ Survey' },
  { value: 'marking',       label: '📍 Survey + Marking' },
  { value: 'drawing',       label: '✏️ Drawing' },
  { value: 'visualization', label: '🏗️ 3D Visualization' },
  { value: 'qs_boq',        label: '📊 QS + BOQ' },
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
  const [selectedSource, setSelectedSource] = useState('');
  const [gstRequired, setGstRequired] = useState('no');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isOther = selectedType === 'Other';
  const isFieldWorkflow = selectedWorkflow === 'marking' || selectedWorkflow === 'survey';
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
    if (!selectedWorkflow)         e.workflowType  = 'Designated workflow is required';
    if (!selectedSource)           e.source        = 'Lead source is required';
    if (gstRequired === 'yes' && !form.gstNumber?.trim()) {
      e.gstNumber = 'GST number is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const payload: NewLead = {
      name: form.name!,
      client: form.client!,
      clientPhone: form.clientPhone!,
      location: form.location!,
      type: isOther ? (form.customType ?? 'Other') : selectedType!,
      workflowType: selectedWorkflow as WorkflowType,
      source: selectedSource!,
      value: form.value ?? 0,
      scheduledDate: form.scheduledDate,
      deadline: form.deadline,
      description: form.description,
      gstNumber: gstRequired === 'yes' ? form.gstNumber : undefined,
    };
    addLead(payload);
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setForm({});
    setSelectedType('');
    setSelectedWorkflow('');
    setSelectedSource('');
    setErrors({});
  };

  // Helpers to prevent timezone shifting in inputs
  const toLocalDatetime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const toLocalDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Lead" description="Create a new lead and assign it to a workflow.">
      <div className="space-y-4">

        {/* Project Name */}
        <Field label="Project Name" required error={errors.name}>
          <InputRow icon={<Layers className="w-3.5 h-3.5" />} placeholder="e.g. Layout Marking - Phase 1"
            value={form.name ?? ''} onChange={(v) => setField('name', v)} hasError={!!errors.name} />
        </Field>

        {/* Client */}
        <Field label="Client / Company Name" required error={errors.client}>
          <InputRow icon={<Building2 className="w-3.5 h-3.5" />} placeholder="Client Name"
            value={form.client ?? ''} onChange={(v) => setField('client', v)} hasError={!!errors.client} />
        </Field>

        {/* Phone */}
        <Field label="Client Phone Number" required error={errors.clientPhone}>
          <InputRow icon={<Phone className="w-3.5 h-3.5" />} placeholder="Phone Number" type="tel"
            value={form.clientPhone ?? ''} onChange={(v) => setField('clientPhone', v)} hasError={!!errors.clientPhone} />
        </Field>

        {/* Location */}
        <Field label="Location / Address" required error={errors.location}>
          <InputRow icon={<MapPin className="w-3.5 h-3.5" />} placeholder="Site Location"
            value={form.location ?? ''} onChange={(v) => setField('location', v)} hasError={!!errors.location} />
        </Field>

        {/* Amount */}
        <Field label="Project Amount (₹) (Optional)">
          <InputRow icon={<IndianRupee className="w-3.5 h-3.5" />} placeholder="Amount" type="number"
            value={form.value !== undefined ? String(form.value) : ''}
            onChange={(v) => setField('value', v === '' ? 0 : Number(v))} />
        </Field>

        {/* Description */}
        <Field label="Description / Scope (Optional)">
          <div className="relative">
            <Info className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Any specific details or requirements…"
              className="w-full min-h-[80px] py-2.5 !pl-10 pr-4 rounded-xl border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all resize-y"
            />
          </div>
        </Field>

        {/* GST Required Dropdown */}
        <div className="space-y-4">
          <Field label="GST Required?">
            <div className="relative">
              <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
              <select value={gstRequired}
                onChange={(e) => {
                  setGstRequired(e.target.value);
                  if (e.target.value === 'no') {
                    setField('gstNumber', '');
                    setErrors((p) => { const n = {...p}; delete n.gstNumber; return n; });
                  }
                }}
                className={SELECT_CLS}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </Field>

          {gstRequired === 'yes' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <Field label="GST Number" required error={errors.gstNumber}>
                <InputRow icon={<Building2 className="w-3.5 h-3.5" />} placeholder="Enter GST Number"
                  value={form.gstNumber ?? ''} onChange={(v) => setField('gstNumber', v)} hasError={!!errors.gstNumber} />
              </Field>
            </motion.div>
          )}
        </div>

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

        {/* Lead Source */}
        <Field label="Lead Source" required error={errors.source}>
          <div className="relative">
            <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
            <select value={selectedSource}
              onChange={(e) => { setSelectedSource(e.target.value); setErrors((p) => { const n = {...p}; delete n.source; return n; }); }}
              className={errors.source ? SELECT_ERROR_CLS : SELECT_CLS}>
              <option value="">Select lead source…</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
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
        </Field>

        {/* Scheduled Date (field visit) — for marking/mapping workflows */}
        {isFieldWorkflow && (
          <Field label="Scheduled Field-Visit Date" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
              <input type="datetime-local"
                min={toLocalDatetime(new Date().toISOString())}
                value={toLocalDatetime(form.scheduledDate)}
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
                min={toLocalDate(new Date().toISOString())}
                value={toLocalDate(form.deadline)}
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
