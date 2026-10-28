import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';

// Escape key hook — dismiss modal on Escape press
function useEscapeKey(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  width?: number;
  footer?: ReactNode;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, width = 560, footer, children }: ModalProps) {
  useEscapeKey(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-onyx/80 backdrop-blur-md z-50"
          />

          {/* Responsive Modal Container: bottom-sheet on mobile, centered dialog on md+ */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                       bg-onyx border-t md:border border-white/[0.08]
                       shadow-[0_0_80px_rgba(0,0,0,0.6)] z-50 overflow-hidden flex flex-col
                       max-h-[92vh] md:max-h-[90vh] rounded-t-[12px] md:rounded-xl w-full"
            style={{ maxWidth: `min(${width}px, 95vw)` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <div className="flex md:hidden justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-border-dark rounded-full" />
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 md:p-6 border-b border-white/[0.06] flex-shrink-0">
              <button onClick={onClose} aria-label="Close modal" className="md:hidden text-text-muted hover:text-text-primary transition-colors tap-target">
                <ArrowLeft size={20} />
              </button>
              <div className="font-heading text-lg md:text-xl font-semibold tracking-normal text-text-primary flex-1 min-w-0">
                {title}
              </div>
              <button onClick={onClose} aria-label="Close modal" className="hidden md:inline-flex text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar scroll-touch flex-1 min-h-0">
              {children}
            </div>
            {footer && (
              <div className="p-6 border-t border-white/[0.06] flex-shrink-0 bg-onyx">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

