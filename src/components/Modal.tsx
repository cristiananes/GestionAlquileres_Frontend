'use client';

import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-base md:text-lg font-semibold truncate pr-2">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 md:p-5">{children}</div>
      </div>
    </div>
  );
}
