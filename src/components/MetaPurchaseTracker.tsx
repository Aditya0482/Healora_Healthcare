'use client';

import { useEffect, useRef } from 'react';
import * as fpixel from '@/lib/fpixel';

interface MetaPurchaseTrackerProps {
  orderNumber: string;
  amount: number; // in rupees
  currency?: string;
  contentIds: string[];
  numItems: number;
}

export default function MetaPurchaseTracker({
  orderNumber,
  amount,
  currency = 'INR',
  contentIds,
  numItems,
}: MetaPurchaseTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    const sessionKey = `meta_purchase_tracked_${orderNumber}`;

    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      fpixel.event('Purchase', {
        value: amount,
        currency,
        content_type: 'product',
        content_ids: contentIds,
        num_items: numItems,
        order_id: orderNumber,
      });
      sessionStorage.setItem(sessionKey, 'true');
      trackedRef.current = true;
    }
  }, [orderNumber, amount, currency, contentIds, numItems]);

  return null;
}
