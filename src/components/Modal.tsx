'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (open) element?.showModal();
    return () => { element?.close(); };
  }, [open]);
  if (!open) return null;

  return (
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={onClose} className="fixed inset-0 z-50 m-auto w-full max-w-lg max-h-[90vh] bg-transparent p-2 backdrop:bg-black/50 text-inherit">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-5 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 id={titleId} className="text-base md:text-lg font-semibold truncate pr-2">{title}</h2>
          <button aria-label="Cerrar ventana" onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 md:p-5">{children}</div>
      </div>
    </dialog>
  );
}
