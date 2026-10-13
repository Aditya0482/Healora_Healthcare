'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminOrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=orders');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
    </div>
  );
}
