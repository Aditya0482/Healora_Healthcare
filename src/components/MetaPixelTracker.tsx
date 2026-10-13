'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import * as fpixel from '@/lib/fpixel';

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      fpixel.pageview();
    }
  }, [pathname, searchParams]);

  return null;
}
