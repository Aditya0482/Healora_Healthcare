'use client';

import React, { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import PaymentReceiptModal from './PaymentReceiptModal';

interface ReceiptActionButtonsProps {
  order: any;
  variant?: 'primary' | 'compact' | 'outline';
}

export default function ReceiptActionButtons({ order, variant = 'primary' }: ReceiptActionButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownloadClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      {variant === 'primary' && (
        <button
          onClick={handleDownloadClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-5 rounded-xl transition shadow flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Receipt</span>
        </button>
      )}

      {variant === 'outline' && (
        <button
          onClick={handleDownloadClick}
          className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Receipt</span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleDownloadClick}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg transition border border-emerald-200 flex items-center gap-1.5"
          title="Download Receipt"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Download Receipt</span>
        </button>
      )}

      <PaymentReceiptModal
        order={order}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
