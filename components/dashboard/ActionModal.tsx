'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Project, LeadDetails } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';
import { CheckCircle, GitBranch, AlertTriangle, Phone, MapPin, User, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Sales Action Modal ───────────────────────────────────────────────────────

interface SalesActionModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SalesActionModal({ project, isOpen, onClose }: SalesActionModalProps) {
  const [surveyRequired, setSurveyRequired] = useState<boolean | null>(null);
  const [clientPhone, setClientPhone] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { confirmLead } = useProjectStore();

  const isValid = surveyRequired !== null && clientPhone.trim().length >= 10;

  const handleConfirm = async () => {
    if (!project || !isValid) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    confirmLead(project.id, surveyRequired!, { clientPhone: clientPhone.trim(), mapsLink: mapsLink.trim() } as LeadDetails);
    setIsLoading(false);
    handleClose();
  };

  const handleClose = () => { onClose(); setSurveyRequired(null); setClientPhone(''); setMapsLink(''); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Lead" description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className="space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/8">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Client Contact Details
          </p>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 dark:text-slate-400">Mobile Number <span className="text-red-400">*</span></label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 98765 43210" className="input-base pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 dark:text-slate-400">Google Maps Link</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="url" value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} placeholder="https://maps.google.com/…" className="input-base pl-9" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-blue-500" /> Is a Survey Required?
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <ToggleOption selected={surveyRequired === true}  onClick={() => setSurveyRequired(true)}  label="Yes — Survey"   sublabel="Route to Survey"  color="amber" />
            <ToggleOption selected={surveyRequired === false} onClick={() => setSurveyRequired(false)} label="No — Skip"      sublabel="Route to Mapping" color="slate" />
          </div>
        </div>

        {surveyRequired === false && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">Survey will be <strong>Bypassed</strong>. Project goes to Mapping.</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="md" className="flex-1" disabled={!isValid} isLoading={isLoading} icon={<CheckCircle className="w-4 h-4" />} onClick={handleConfirm}>
            Confirm Lead
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Survey — Step 1: Mark Reached Location ───────────────────────────────────

interface ReachedLocationModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReachedLocationModal({ project, isOpen, onClose }: ReachedLocationModalProps) {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Site Arrival" description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Navigation className="w-4 h-4 text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Step 1 of 2 — Site Arrival</p>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Confirm that the field team has reached the project site. After this, you'll be able to mark the survey as complete.
          </p>
        </div>

        {project?.mapsLink && (
          <a href={project.mapsLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
            <MapPin className="w-3.5 h-3.5" /> View project location on Google Maps
          </a>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" size="md" className="flex-1" isLoading={isLoading} icon={<Navigation className="w-4 h-4" />} onClick={handleConfirm}>
            Confirm Reached
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Survey — Step 2: Complete Survey ─────────────────────────────────────────

interface SurveyActionModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SurveyActionModal({ project, isOpen, onClose }: SurveyActionModalProps) {
  const [mappingRequired, setMappingRequired] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { completeSurvey } = useProjectStore();

  const handleConfirm = async () => {
    if (!project || mappingRequired === null) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    completeSurvey(project.id, mappingRequired);
    setIsLoading(false);
    onClose();
    setMappingRequired(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Survey" description={project?.name ?? ''}>
      <div className="space-y-4">
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-300 mb-0.5">Step 2 of 2 — Mark Complete</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">Survey is complete. Select the next stage.</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-amber-500" /> Is Mapping Required?
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <ToggleOption selected={mappingRequired === true}  onClick={() => setMappingRequired(true)}  label="Yes — Mapping" sublabel="Route to Mapping"      color="emerald" />
            <ToggleOption selected={mappingRequired === false} onClick={() => setMappingRequired(false)} label="No — Skip"     sublabel="Bypass to Accounts"    color="slate"   />
          </div>
        </div>

        {mappingRequired === false && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Mapping</strong> &amp; <strong>Drafting</strong> will be Bypassed. Goes to Accounts.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="success" size="md" className="flex-1" disabled={mappingRequired === null} isLoading={isLoading} icon={<CheckCircle className="w-4 h-4" />} onClick={handleConfirm}>
            Complete Survey
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Generic Confirm Modal ─────────────────────────────────────────────────────

interface GenericActionModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: (projectId: string) => void;
  variant?: 'primary' | 'success' | 'danger';
  accentColor?: 'blue' | 'emerald' | 'pink' | 'sky';
}

export function GenericActionModal({ project, isOpen, onClose, title, description, actionLabel, onConfirm, variant = 'primary', accentColor = 'blue' }: GenericActionModalProps) {
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
    blue:    'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    pink:    'bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20 text-pink-700 dark:text-pink-300',
    sky:     'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300',
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

// ─── Shared Toggle Option ─────────────────────────────────────────────────────

function ToggleOption({ selected, onClick, label, sublabel, color }: {
  selected: boolean; onClick: () => void; label: string; sublabel: string; color: string;
}) {
  const sel: Record<string, string> = {
    amber:   'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-500/10',
    emerald: 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
    slate:   'border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-700/20',
  };
  return (
    <button onClick={onClick} className={cn(
      'p-2.5 rounded-xl border text-left transition-all duration-150',
      selected ? sel[color] ?? 'border-blue-400 bg-blue-50' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 hover:bg-slate-50 dark:hover:bg-white/8'
    )}>
      <p className={cn('text-xs font-semibold', selected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300')}>{label}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sublabel}</p>
    </button>
  );
}
