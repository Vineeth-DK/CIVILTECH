'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;      // bg color class for the icon box
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  index?: number;
}

export function StatCard({
  label,
  value,
  icon,
  color,
  change,
  changeType = 'neutral',
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="relative glass rounded-2xl p-5 overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-display font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                changeType === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : changeType === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            color
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface StatsRowProps {
  stats: Omit<StatCardProps, 'index'>[];
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} index={i} />
      ))}
    </div>
  );
}
