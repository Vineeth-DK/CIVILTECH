'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/store/useProjectStore';
import { NewLead, ProjectType } from '@/types';
import { PlusCircle, Building2, Phone, MapPin, Calendar, Layers } from 'lucide-react';

const PROJECT_TYPES: ProjectType[] = [
  'Road Construction', 'Bridge Engineering', 'Drainage System', 'Structural Audit',
  'Land Survey', 'Residential Layout', 'Commercial Development', 'Water Treatment',
  'Highway Expansion', 'Flyover Design',
];

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const { addLead } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Partial<NewLead>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof NewLead, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim())        e.name        = 'Project name is required';
    if (!form.client?.trim())      e.client      = 'Client name is required';
    if (!form.clientPhone?.trim() || form.clientPhone.trim().length < 10)
                                   e.clientPhone = 'Valid phone number required';
    if (!form.location?.trim())    e.location    = 'Location is required';
    if (!form.type)                e.type        = 'Project type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    addLead(form as NewLead);
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setForm({});
    setErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Lead" description="Fill in the client and project details">
      <div className="space-y-4">
        {/* Project Name */}
        <Field label="Project Name" required error={errors.name}>
          <Input icon={<Layers />} placeholder="e.g. NH-48 Highway Widening"
            value={form.name ?? ''} onChange={(v) => set('name', v)} error={!!errors.name} />
        </Field>

        {/* Client / Company */}
        <Field label="Client / Company Name" required error={errors.client}>
          <Input icon={<Building2 />} placeholder="e.g. Karnataka PWD"
            value={form.client ?? ''} onChange={(v) => set('client', v)} error={!!errors.client} />
        </Field>

        {/* Phone */}
        <Field label="Client Mobile Number" required error={errors.clientPhone}>
          <Input icon={<Phone />} placeholder="+91 98765 43210" type="tel"
            value={form.clientPhone ?? ''} onChange={(v) => set('clientPhone', v)} error={!!errors.clientPhone} />
        </Field>

        {/* Location */}
        <Field label="Location" required error={errors.location}>
          <Input icon={<MapPin />} placeholder="e.g. Whitefield, Bengaluru"
            value={form.location ?? ''} onChange={(v) => set('location', v)} error={!!errors.location} />
        </Field>

        {/* Maps Link */}
        <Field label="Google Maps Link">
          <Input icon={<MapPin />} placeholder="https://maps.google.com/…" type="url"
            value={form.mapsLink ?? ''} onChange={(v) => set('mapsLink', v)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {/* Project Type */}
          <Field label="Project Type" required error={errors.type}>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={form.type ?? ''}
                onChange={(e) => set('type', e.target.value)}
                className={`input-base pl-9 appearance-none ${errors.type ? 'border-red-400 ring-2 ring-red-400/20' : ''}`}
              >
                <option value="">Select type</option>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </Field>

          {/* Deadline */}
          <Field label="Deadline">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input type="date"
                value={form.deadline?.split('T')[0] ?? ''}
                onChange={(e) => set('deadline', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="input-base pl-9" />
            </div>
          </Field>
        </div>

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

// ── Small helpers ─────────────────────────────────────────────────────────────

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

function Input({ icon, placeholder, type = 'text', value, onChange, error }: {
  icon: React.ReactNode; placeholder: string; type?: string; value: string; onChange: (v: string) => void; error?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none [&>svg]:w-3.5 [&>svg]:h-3.5">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-base pl-9 ${error ? 'border-red-400 dark:border-red-500/70 ring-2 ring-red-400/20' : ''}`}
      />
    </div>
  );
}
