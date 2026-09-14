import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TextArea } from '../common/Input';
import { RotateCcw, AlertCircle } from 'lucide-react';

interface ReturnReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
  loading?: boolean;
}

export const ReturnReportModal: React.FC<ReturnReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('يرجى توضيح سبب إعادة التقرير والملاحظات المطلوبة لمعد التقرير.');
      return;
    }
    setError('');
    await onSubmit(comment.trim());
    setComment('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إعادة التقرير للجهة للتعديل"
      subtitle="سيتم إرسال ملاحظاتك لمعد التقرير وتغيير حالة التقرير إلى معاد للتعديل"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p>
            يرجى كتابة ملاحظات دقيقة وموجزة لتسهيل معالجة النواقص أو تصحيح الأرقام والبيانات من قبل
            الجهة المعنية.
          </p>
        </div>

        <TextArea
          label="سبب الإعادة وملاحظات وتوجيهات الإدارة"
          placeholder="اكتب التوجيهات والملاحظات المطلوب تعديلها من قبل القسم..."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (error) setError('');
          }}
          error={error}
          requiredIndicator
          rows={4}
          disabled={loading}
        />

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="w-full sm:w-auto justify-center">
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="danger"
            loading={loading}
            icon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto justify-center font-bold"
          >
            تأكيد إعادة التقرير
          </Button>
        </div>
      </form>
    </Modal>
  );
};
