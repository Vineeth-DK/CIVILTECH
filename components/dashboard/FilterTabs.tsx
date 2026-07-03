'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface FilterTab {
  id: string;
  label: string;
  count: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function FilterTabs({ tabs, activeTab, onChange, className }: FilterTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-2xl',
        'bg-slate-200/60 dark:bg-white/5',
        'border border-slate-300/40 dark:border-white/8',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap',
              isActive
                ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm shadow-black/10 dark:shadow-black/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-filter-tab"
                className="absolute inset-0 rounded-xl bg-white dark:bg-white/15 shadow-sm shadow-black/10 dark:shadow-black/30"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            <span
              className={cn(
                'relative z-10 text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[22px] text-center tabular-nums',
                isActive
                  ? 'bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-300/60 dark:bg-white/10 text-slate-500 dark:text-slate-500'
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
