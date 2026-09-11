'use client';

import React from 'react';

export default function WhatsAppButton() {
  const phoneNumber = '919820011223'; // Store helpline
  const message = encodeURIComponent('Hi, I want to inquire about products on Healora Healthcare.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center group">
      {/* Tooltip on hover */}
      <span className="hidden sm:inline-block absolute right-full mr-3 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none">
        Chat with us on WhatsApp
      </span>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Soft pulse glow ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping -z-10" />

        {/* Official WhatsApp SVG Icon */}
        <svg
          className="w-7 h-7 fill-white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.477-.15-.678.15-.2.301-.778.979-.954 1.18-.175.2-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.784-1.674-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.502.1-.2.05-.376-.025-.527-.075-.15-.678-1.633-.929-2.238-.244-.589-.493-.509-.678-.518-.175-.009-.376-.01-.577-.01-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.2 2.124 3.243 5.145 4.549.719.31 1.28.496 1.718.635.722.23 1.378.198 1.897.12.578-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.748.457 3.453 1.326 4.962L2 22l5.302-1.39A9.877 9.877 0 0 0 12.04 21.8c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm0 18.06c-1.503 0-2.977-.404-4.265-1.168l-.306-.182-3.17.832.846-3.09-.199-.317A8.13 8.13 0 0 1 3.91 11.9c0-4.483 3.647-8.13 8.13-8.13 4.483 0 8.13 3.647 8.13 8.13 0 4.484-3.647 8.16-8.13 8.16z" />
        </svg>
      </a>
    </div>
  );
}