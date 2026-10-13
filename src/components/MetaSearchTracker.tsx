'use client';

import { useEffect, useRef } from 'react';
import * as fpixel from '@/lib/fpixel';

export default function MetaSearchTracker({ query }: { query: string }) {
  const trackedRef = useRef<string>('');

  useEffect(() => {
    if (query && trackedRef.current !== query) {
      fpixel.event('Search', {
        search_string: query,
      });
      trackedRef.current = query;
    }
  }, [query]);

  return null;
}
