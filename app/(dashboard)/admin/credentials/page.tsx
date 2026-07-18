'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/dashboard/Topbar';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Download, Save, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CredentialsPage() {
  const { credentials, fetchCredentials, updateCredential, isLoading } = useAuthStore();
  const [editingUsers, setEditingUsers] = useState<Record<string, { name: string; dept: string; password: string }>>({});
  const [savingUser, setSavingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  // Initialize editable state
  useEffect(() => {
    if (Object.keys(credentials).length > 0 && Object.keys(editingUsers).length === 0) {
      const initial: typeof editingUsers = {};
      for (const [username, cred] of Object.entries(credentials)) {
        initial[username] = { name: cred.name, dept: cred.dept, password: cred.password };
      }
      setEditingUsers(initial);
    }
  }, [credentials]);

  const handleExport = () => {
    const header = ['Username', 'Role', 'Name', 'Department', 'Password'];
    const rows = Object.entries(credentials).map(([username, cred]) => [
      username,
      cred.role,
      `"${cred.name}"`,
      `"${cred.dept}"`,
      `"${cred.password}"`
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivilTech_Credentials_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async (username: string) => {
    const updates = editingUsers[username];
    if (!updates) return;
    setSavingUser(username);
    await updateCredential(username, updates);
    setSavingUser(null);
  };

  const handleChange = (username: string, field: 'name' | 'dept' | 'password', value: string) => {
    setEditingUsers(prev => ({
      ...prev,
      [username]: { ...prev[username], [field]: value }
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="User Management" subtitle="Manage credentials and export user lists" />
      <div className="flex-1 p-5 overflow-y-auto space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-xl font-medium text-sm">
            <Users className="w-4 h-4" />
            {Object.keys(credentials).length} Users Registered
          </div>
          <Button variant="primary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export to CSV
          </Button>
        </div>

        {isLoading && Object.keys(credentials).length === 0 ? (
          <div className="text-center py-10 text-slate-500">Loading credentials...</div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Username</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Department</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">Password</th>
                    <th className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {Object.entries(credentials).map(([username, cred]) => {
                    const editState = editingUsers[username] || { name: cred.name, dept: cred.dept, password: cred.password };
                    const isChanged = editState.name !== cred.name || editState.dept !== cred.dept || editState.password !== cred.password;

                    return (
                      <motion.tr key={username} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white capitalize">{username}</td>
                        <td className="px-5 py-3 text-slate-500">{cred.role}</td>
                        <td className="px-5 py-3">
                          <input type="text" value={editState.name} onChange={e => handleChange(username, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 focus:border-blue-500 focus:outline-none py-1" />
                        </td>
                        <td className="px-5 py-3">
                          <input type="text" value={editState.dept} onChange={e => handleChange(username, 'dept', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 focus:border-blue-500 focus:outline-none py-1" />
                        </td>
                        <td className="px-5 py-3">
                          <input type="text" value={editState.password} onChange={e => handleChange(username, 'password', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 focus:border-blue-500 focus:outline-none py-1 font-mono text-xs" />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button variant={isChanged ? 'primary' : 'secondary'} size="sm" 
                            disabled={!isChanged || savingUser === username}
                            isLoading={savingUser === username}
                            onClick={() => handleSave(username)}>
                            <Save className="w-4 h-4 mr-1" /> Save
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
