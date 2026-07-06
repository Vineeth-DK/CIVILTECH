'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useProjectStore } from '@/store/useProjectStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, initProjects } = useProjectStore();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    } else {
      initProjects();
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
