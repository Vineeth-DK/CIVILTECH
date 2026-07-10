'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  TrendingUp, Map, Layers, PenTool, DollarSign, ShieldCheck,
  ChevronLeft, ChevronRight, LogOut, Box,
  SlidersHorizontal, Clock, LayoutGrid, BarChart2, XCircle, Calculator,
} from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import { Role, StatusFilter } from '@/types';

// Admin-only top-level navigation
const ADMIN_NAV = [
  { href: '/admin',            icon: ShieldCheck, label: 'Overview',              active: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { href: '/admin/cancelled',  icon: XCircle,     label: 'Cancelled / Reschedule', active: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' },
  { href: '/admin/statistics', icon: BarChart2,    label: 'Statistics',             active: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
];

// Dept navigation (all roles have one of these)
const NAV_ITEMS = [
  { role: 'sales'         as Role, href: '/sales',         icon: TrendingUp,  label: 'Sales',             active: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { role: 'survey'        as Role, href: '/survey',        icon: Map,         label: 'Survey',            active: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { role: 'mapping'       as Role, href: '/mapping',       icon: Layers,      label: 'Mapping',           active: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { role: 'drawing'       as Role, href: '/drawing',       icon: PenTool,     label: 'Drawing',           active: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { role: 'visualization' as Role, href: '/visualization', icon: Box,         label: '3D Visualization',  active: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { role: 'qs_boq'        as Role, href: '/qs_boq',        icon: Calculator,  label: 'QS + BOQ',          active: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' },
  { role: 'accounts'      as Role, href: '/accounts',      icon: DollarSign,  label: 'Accounts',          active: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' },
];

// Non-admin users ONLY see their pending tasks — no status picker needed
// For simplicity, we show a single "Pending" filter item so the sidebar
// still shows the count and keeps the UX consistent.
const ROLE_FILTERS: Record<Role, { id: StatusFilter; label: string; icon: React.ElementType }[]> = {
  admin:         [],   // Admin has no filter sidebar — uses Topbar search only
  sales:         [{ id: 'in_progress', label: 'Pending Leads',    icon: Clock }],
  survey:        [{ id: 'in_progress', label: 'Pending Surveys',  icon: Clock }],
  mapping:       [{ id: 'in_progress', label: 'Pending Tasks',    icon: Clock }],
  drawing:       [{ id: 'in_progress', label: 'Pending Tasks',    icon: Clock }],
  visualization: [{ id: 'in_progress', label: 'Pending Tasks',    icon: Clock }],
  qs_boq:        [{ id: 'in_progress', label: 'Pending Tasks',    icon: Clock }],
  accounts:      [{ id: 'in_progress', label: 'Pending Invoices', icon: Clock }],
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, currentFilter, setCurrentFilter, getProjectsByDeptStatus } = useProjectStore();

  const role  = currentUser?.role ?? 'admin';
  const stage = role === 'admin' ? null : role as Exclude<Role, 'admin'>;

  const handleLogout = () => { logout(); router.push('/'); };

  const visibleNavItems = role === 'admin' ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.role === role);
  const filters = ROLE_FILTERS[role] ?? [];

  // Only count pending (in_progress) for badge — completed hidden from non-admin
  const counts = stage ? {
    all:         getProjectsByDeptStatus(stage, 'in_progress').length,
    in_progress: getProjectsByDeptStatus(stage, 'in_progress').length,
  } : {} as Record<string, number>;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ type: 'spring', damping: 26, stiffness: 200 }}
      className="relative h-screen flex flex-col glass border-r border-slate-200/50 dark:border-white/5 overflow-hidden z-20 flex-shrink-0"
    >
      {/* ── Logo + collapse toggle (fully inside sidebar) ────────────────── */}
      <div className={cn("relative flex items-center px-3 py-3 border-b border-slate-200/50 dark:border-white/5 min-h-[56px]", collapsed ? "justify-center" : "gap-2.5")}>
        {/* Logo */}
        {!collapsed && (
          <>
            <div className="relative flex-shrink-0 transition-all duration-200 w-32 h-10 dark:bg-white/95 dark:px-2 dark:py-1 dark:rounded-lg shadow-sm dark:shadow-white/10 flex items-center justify-center">
              <Image src="/logo.png" alt="CivilTech" fill sizes="128px" className="object-contain p-1" priority />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">Workflow Platform</p>
            </motion.div>
          </>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-lg transition-colors',
            'bg-slate-100 dark:bg-white/8 border border-slate-200 dark:border-white/10',
            'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
            'hover:bg-slate-200 dark:hover:bg-white/15',
            collapsed ? '' : 'ml-auto'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* ── Admin-only Navigation ─────────────────────────────────────────── */}
      {role === 'admin' && (
        <nav className="px-2 py-2 space-y-0.5 border-b border-slate-200/50 dark:border-white/5">
          <AnimatePresence>
            {!collapsed && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Admin
              </motion.p>
            )}
          </AnimatePresence>
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div whileHover={{ x: collapsed ? 0 : 2 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 border',
                    collapsed && 'justify-center px-2',
                    isActive ? item.active : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border-transparent'
                  )}>
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium truncate">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      )}

      {/* ── Dept Navigation ────────────────────────────────────────────────── */}
      <nav className="px-2 py-2.5 space-y-0.5">
        <AnimatePresence>
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {role === 'admin' ? 'Departments' : 'Navigation'}
            </motion.p>
          )}
        </AnimatePresence>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div whileHover={{ x: collapsed ? 0 : 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 border',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? item.active
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border-transparent'
                )}>
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium truncate">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Status Filters (pending only for non-admin) ───────────────────── */}
      {filters.length > 0 && (
        <div className="px-2 py-2.5 border-t border-slate-200/50 dark:border-white/5 space-y-0.5">
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 px-3 mb-1.5 mt-2">
                <SlidersHorizontal className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tasks</p>
              </motion.div>
            )}
          </AnimatePresence>
          {filters.map((f) => {
            const isActive = currentFilter === f.id;
            const Icon = f.icon;
            const count = counts[f.id] ?? 0;
            return (
              <div key={f.id}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left',
                  collapsed && 'justify-center px-2',
                  'bg-blue-500/5 border-blue-500/10 text-blue-600 dark:text-blue-400 cursor-default'
                )}>
                <Icon className="w-[18px] h-[18px] flex-shrink-0 opacity-80" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between flex-1 min-w-0">
                      <span className="text-sm font-medium truncate opacity-90">{f.label}</span>
                      <span className={cn(
                        'text-[11px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums min-w-[20px] text-center',
                        'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      )}>{count}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1" />

      {/* ── User + logout ─────────────────────────────────────────────────── */}
      <div className="px-2 py-3 border-t border-slate-200/50 dark:border-white/5 space-y-1">
        {currentUser && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate leading-none">{currentUser.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">{currentUser.role}</p>
            </div>
          </div>
        )}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 border border-transparent',
            'text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400',
            'hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/20',
            collapsed && 'justify-center px-2'
          )}>
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">Sign Out</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
