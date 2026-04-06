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

export function Modal({ isOpen, onClose, title, width = 500, footer, children }: ModalProps) {
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

          {/* Mobile: bottom sheet that slides up */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-[#141820] border-t border-border-dark
                       flex flex-col max-h-[92vh] rounded-t-[16px] overflow-hidden"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-border-dark rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border-dark flex-shrink-0">
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors tap-target">
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-lg tracking-tighter text-text-primary capitalize truncate">{title}</h2>
              </div>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar scroll-touch flex-1 min-h-0">
              {children}
            </div>
            {footer && (
              <div className="p-5 border-t border-border-dark flex-shrink-0 bg-[#141820]">
                {footer}
              </div>
            )}
          </motion.div>

          {/* Desktop: centered modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="hidden md:flex fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       bg-[#141820] border border-border-dark
                       shadow-[0_0_60px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex-col max-h-[90vh] rounded-sm"
            style={{ width: `${width}px`, maxWidth: '95vw' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            <div className="flex items-center justify-between p-6 border-b border-border-dark">
              <h2 className="font-heading text-xl tracking-tighter text-text-primary capitalize flex-1">{title}</h2>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors hover:rotate-90 duration-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar min-h-0">
              {children}
            </div>
            {footer && (
              <div className="p-6 border-t border-border-dark flex-shrink-0 bg-[#141820]">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

