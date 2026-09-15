import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, AlertTriangle, AlertCircle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setModalState({
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmText: options.confirmText || (options.isDanger !== false ? 'Delete' : 'Confirm'),
        cancelText: options.cancelText || 'Cancel',
        isDanger: options.isDanger !== false, // default to danger
        isWarning: Boolean(options.isWarning),
      });
    });
  }, []);

  const handleConfirm = () => {
    if (resolveRef.current) {
      resolveRef.current(true);
    }
    setModalState(null);
  };

  const handleCancel = () => {
    if (resolveRef.current) {
      resolveRef.current(false);
    }
    setModalState(null);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalState) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modalState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  modalState.isDanger
                    ? 'bg-rose-50 border border-rose-200/80 text-rose-600 shadow-2xs'
                    : modalState.isWarning
                    ? 'bg-amber-50 border border-amber-200/80 text-amber-600 shadow-2xs'
                    : 'bg-emerald-50 border border-emerald-200/80 text-emerald-600 shadow-2xs'
                }`}
              >
                {modalState.isDanger ? (
                  <Trash2 className="w-6 h-6" />
                ) : modalState.isWarning ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1.5 flex-1 pr-4">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {modalState.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {modalState.message}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                {modalState.cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  modalState.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {modalState.isDanger && <Trash2 className="w-3.5 h-3.5" />}
                <span>{modalState.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
