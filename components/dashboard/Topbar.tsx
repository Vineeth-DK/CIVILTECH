'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Sun, Moon, Calendar, ChevronDown, X } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { RoleBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { DateFilter } from '@/types';

const DATE_OPTIONS: { id: DateFilter; label: string }[] = [
  { id: 'all',   label: 'All Time'   },
  { id: 'today', label: 'Today'      },
  { id: 'week',  label: 'This Week'  },
  { id: 'month', label: 'This Month' },
  { id: 'quarter',label: 'Last 3 Months' },
  { id: 'year',  label: 'This Year'  },
];

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { currentUser, isDarkMode, toggleDarkMode, searchQuery, setSearchQuery, dateFilter, setDateFilter } = useProjectStore();
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  // Close date dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeDate = DATE_OPTIONS.find((d) => d.id === dateFilter) ?? DATE_OPTIONS[0];

  return (
    <header className="h-14 glass border-b border-slate-200/50 dark:border-white/5 flex items-center px-4 gap-3 z-10 sticky top-0">

      {/* ── Left: title ─────────────────────────────────────────────────────── */}
      <div className="w-36 flex-shrink-0 hidden md:block">
        <p className="font-display font-semibold text-slate-900 dark:text-white text-sm leading-none truncate">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>}
      </div>

      {/* ── Center: search bar ───────────────────────────────────────────────── */}
      <div className="flex-1 flex justify-center px-2 min-w-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, clients, locations…"
            className={cn(
              'w-full pl-9 pr-8 py-2 rounded-xl text-sm outline-none transition-all duration-200',
              'bg-slate-100 dark:bg-white/6',
              'border border-slate-200 dark:border-white/10',
              'text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500',
              'focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 dark:focus:border-blue-500/50'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Right: controls ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Date filter dropdown */}
        <div className="relative" ref={dateRef}>
          <button
            onClick={() => setDateOpen(!dateOpen)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
              'border border-slate-200 dark:border-white/10',
              dateFilter !== 'all'
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{activeDate.label}</span>
            <ChevronDown className={cn('w-3 h-3 transition-transform', dateOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {dateOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-1.5 w-36 glass rounded-xl border border-slate-200/60 dark:border-white/10 shadow-xl overflow-hidden z-50"
              >
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setDateFilter(opt.id); setDateOpen(false); }}
                    className={cn(
                      'w-full flex items-center px-3 py-2 text-xs font-medium transition-colors text-left',
                      dateFilter === opt.id
                        ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Dark/Light toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDarkMode ? (
              <motion.div key="sun" initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Sun className="w-4 h-4 text-amber-400" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -80, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Moon className="w-4 h-4 text-blue-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* User */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <RoleBadge role={currentUser.role} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
