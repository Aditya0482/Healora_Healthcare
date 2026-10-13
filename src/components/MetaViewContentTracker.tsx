'use client';

import { useEffect, useRef } from 'react';
import * as fpixel from '@/lib/fpixel';

interface MetaViewContentTrackerProps {
  id: string;
  name: string;
  category?: string;
  price: number; // in rupees
  currency?: string;
}

export default function MetaViewContentTracker({
  id,
  name,
  category,
  price,
  currency = 'INR',
}: MetaViewContentTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    fpixel.event('ViewContent', {
      content_name: name,
      content_category: category || 'Healthcare',
      content_ids: [id],
      content_type: 'product',
      value: price,
      currency,
    });
    trackedRef.current = true;
  }, [id, name, category, price, currency]);

  return null;
}
