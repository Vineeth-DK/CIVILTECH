'use client';

import { create } from 'zustand';
import { Credential } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthStore {
  credentials: Record<string, Credential>;
  isLoading: boolean;
  fetchCredentials: () => Promise<void>;
  updateCredential: (username: string, updates: Partial<Credential>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  credentials: {},
  isLoading: false,

  fetchCredentials: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('credentials').select('*');
    if (error) {
      console.error('Error fetching credentials', error);
      set({ isLoading: false });
      return;
    }
    const creds: Record<string, Credential> = {};
    for (const row of data) {
      creds[row.username] = {
        password: row.password,
        role: row.role as any,
        name: row.name,
        dept: row.dept,
      };
    }
    set({ credentials: creds, isLoading: false });
  },

  updateCredential: async (username: string, updates: Partial<Credential>) => {
    const { credentials } = get();
    const existing = credentials[username];
    if (!existing) return;

    const newCred = { ...existing, ...updates };
    
    // Optimistic update
    set({ credentials: { ...credentials, [username]: newCred } });

    const { error } = await supabase.from('credentials').update({
      password: newCred.password,
      role: newCred.role,
      name: newCred.name,
      dept: newCred.dept,
    }).eq('username', username);

    if (error) {
      console.error('Error updating credential', error);
      // Revert on error
      set({ credentials });
    }
  },
}));
