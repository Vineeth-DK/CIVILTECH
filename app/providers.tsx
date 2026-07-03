'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const isDarkMode = useProjectStore((s) => s.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
