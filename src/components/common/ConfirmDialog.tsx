import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'blue';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'primary',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          {variant === 'danger' ? (
            <div className="p-2 rounded-lg bg-rose-100 text-rose-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <Info className="w-5 h-5" />
            </div>
          )}
          <p className="text-sm text-slate-700 leading-relaxed pt-1">{message}</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading} className="w-full sm:w-auto justify-center">
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : variant === 'blue' ? 'blue' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className="w-full sm:w-auto justify-center font-bold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
