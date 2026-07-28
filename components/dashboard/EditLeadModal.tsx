'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/store/useProjectStore';
import { Project } from '@/types';
import { Layers, Building2, Phone, MapPin, IndianRupee, Save, AlertTriangle, CalendarClock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const LEAD_SOURCES = ['Website', 'Social Media', 'Referral', 'Walk-in', 'Other'];

// Re-use input components locally for the modal
function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
    </div>
  );
}

function InputRow({ icon, hasError, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode; hasError?: boolean }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">{icon}</div>
      <input
        {...props}
        className={cn(
          'w-full h-10 !pl-10 pr-4 rounded-xl border text-sm transition-all bg-white dark:bg-slate-900',
          'text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
          hasError ? 'border-red-400 dark:border-red-500/70 focus:ring-red-400/40' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:ring-blue-500/40 focus:border-blue-400',
          'focus:outline-none focus:ring-2'
        )}
      />
    </div>
  );
}

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function EditLeadModal({ isOpen, onClose, project }: EditLeadModalProps) {
  const { currentUser, requestEdit, editLead } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<Partial<Project>>({});
  const [gstRequired, setGstRequired] = useState('no');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project && isOpen) {
      setForm({
        name: project.name,
        client: project.client,
        clientPhone: project.clientPhone,
        location: project.location,
        source: project.source,
        value: project.value,
        scheduledDate: project.scheduledDate,
        deadline: project.deadline,
        gstNumber: project.gstNumber,
      });
      setGstRequired(project.gstNumber ? 'yes' : 'no');
      setErrors({});
    }
  }, [project, isOpen]);

  if (!project) return null;

  const setField = (key: keyof Project, val: string | number) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim())        e.name          = 'Project name is required';
    if (!form.client?.trim())      e.client        = 'Client name is required';
    if (!form.clientPhone?.trim() || form.clientPhone.trim().length < 10)
                                   e.clientPhone   = 'Valid phone number required (min 10 digits)';
    if (!form.location?.trim())    e.location      = 'Location is required';
    if (!form.source?.trim())      e.source        = 'Lead source is required';
    if (gstRequired === 'yes' && !form.gstNumber?.trim()) {
      e.gstNumber = 'GST number is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !currentUser) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    
    // Admin saves immediately, Sales sends request
    const payload = { ...form, gstNumber: gstRequired === 'yes' ? form.gstNumber : undefined };
    if (currentUser.role === 'admin') {
      editLead(project.id, payload);
    } else {
      requestEdit(project.id, payload, currentUser.name);
    }
    
    setIsLoading(false);
    onClose();
  };

  const isFieldWorkflow = project.workflowType === 'marking' || project.workflowType === 'survey';
  const isDeadlineWorkflow = project.workflowType === 'drawing' || project.workflowType === 'visualization';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Lead Details" description={project.name}>
      <div className="space-y-4">
        {currentUser?.role !== 'admin' && (
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Your edits will be sent to <strong>Admin</strong> for approval before they are permanently applied.</p>
          </div>
        )}

        <Field label="Project Name" required error={errors.name}>
          <InputRow icon={<Layers className="w-3.5 h-3.5" />} placeholder="Project Name"
            value={form.name ?? ''} onChange={(v) => setField('name', v.target.value)} hasError={!!errors.name} />
        </Field>

        <Field label="Client / Company Name" required error={errors.client}>
          <InputRow icon={<Building2 className="w-3.5 h-3.5" />} placeholder="Client Name"
            value={form.client ?? ''} onChange={(v) => setField('client', v.target.value)} hasError={!!errors.client} />
        </Field>

        <Field label="Client Phone Number" required error={errors.clientPhone}>
          <InputRow icon={<Phone className="w-3.5 h-3.5" />} placeholder="Phone Number" type="tel"
            value={form.clientPhone ?? ''} onChange={(v) => setField('clientPhone', v.target.value)} hasError={!!errors.clientPhone} />
        </Field>

        <Field label="Location / Address" required error={errors.location}>
          <InputRow icon={<MapPin className="w-3.5 h-3.5" />} placeholder="Location"
            value={form.location ?? ''} onChange={(v) => setField('location', v.target.value)} hasError={!!errors.location} />
        </Field>

        <Field label="Project Amount (₹)">
          <InputRow icon={<IndianRupee className="w-3.5 h-3.5" />} placeholder="Amount" type="number"
            value={form.value !== undefined ? String(form.value) : ''}
            onChange={(v) => setField('value', v.target.value === '' ? 0 : Number(v.target.value))} />
        </Field>

        <Field label="Lead Source" required error={errors.source}>
          <div className="relative">
            <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
            <select value={form.source ?? ''}
              onChange={(e) => setField('source', e.target.value)}
              className={cn(
                'w-full h-10 !pl-10 pr-4 rounded-xl border text-sm transition-all appearance-none bg-white dark:bg-slate-900',
                'text-slate-900 dark:text-slate-100',
                errors.source ? 'border-red-400 dark:border-red-500/70 focus:ring-red-400/40' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:ring-blue-500/40 focus:border-blue-400',
                'focus:outline-none focus:ring-2'
              )}>
              <option value="">Select lead source…</option>
              {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
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
                className={cn(
                  'w-full h-10 !pl-10 pr-4 rounded-xl border text-sm transition-all appearance-none bg-white dark:bg-slate-900',
                  'text-slate-900 dark:text-slate-100 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400'
                )}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </Field>

          {gstRequired === 'yes' && (
            <Field label="GST Number" required error={errors.gstNumber}>
              <InputRow icon={<Building2 className="w-3.5 h-3.5" />} placeholder="Enter GST Number"
                value={form.gstNumber ?? ''} onChange={(v) => setField('gstNumber', v.target.value)} hasError={!!errors.gstNumber} />
            </Field>
          )}
        </div>

        {isFieldWorkflow && (
          <Field label="Scheduled Field-Visit Date">
            <InputRow icon={<CalendarClock className="w-3.5 h-3.5" />} type="datetime-local"
              value={toLocalDatetime(form.scheduledDate)} 
              onChange={(v) => setField('scheduledDate', v.target.value ? new Date(v.target.value).toISOString() : '')} />
          </Field>
        )}

        {isDeadlineWorkflow && (
          <Field label="Project Deadline">
            <InputRow icon={<CalendarClock className="w-3.5 h-3.5" />} type="date"
              value={toLocalDate(form.deadline)} 
              onChange={(v) => setField('deadline', v.target.value ? new Date(v.target.value).toISOString() : '')} />
          </Field>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" className="flex-1" isLoading={isLoading} icon={<Save className="w-4 h-4" />} onClick={handleSubmit}>
            {currentUser?.role === 'admin' ? 'Save Changes' : 'Request Approval'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
