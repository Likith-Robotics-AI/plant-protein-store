// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] animate-bounce-in">
        <div className="bg-white rounded-full p-1">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <div className="flex-grow">
          <p className="font-bold">Added to Cart!</p>
          <p className="text-sm text-green-100">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-green-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
