import React, { useState, useEffect } from 'react';
import { DailyReport, ReportTemplate, Attachment } from '../../types';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { AttachmentUploader } from './AttachmentUploader';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { validateReportAnswers } from '../../utils/validators';
import { useToast } from '../../contexts/ToastContext';
import { Save, Send, AlertCircle, Info, Calendar } from 'lucide-react';
import { formatArabicDate, formatNumericDate } from '../../utils/dateUtils';

interface DynamicReportFormProps {
  template: ReportTemplate;
  report?: DailyReport | null;
  reportDate: string;
  userId: string;
  unitId: string;
  unitName: string;
  onSaveDraft: (answers: Record<string, any>, attachments: Attachment[]) => Promise<void>;
  onSubmitReport: (answers: Record<string, any>, attachments: Attachment[]) => Promise<void>;
  loading?: boolean;
}

export const DynamicReportForm: React.FC<DynamicReportFormProps> = ({
  template,
  report,
  reportDate,
  userId,
  unitId,
  unitName,
  onSaveDraft,
  onSubmitReport,
  loading = false
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { error: toastError } = useToast();

  // Load existing answers & attachments into state
  useEffect(() => {
    if (report) {
      const initialAns: Record<string, any> = {};
      if (report.answers) {
        report.answers.forEach((ans) => {
          let val = ans.value;
          // Parse JSON if needed
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try {
              val = JSON.parse(val);
            } catch {
              // keep as string
            }
          }
          initialAns[ans.field_id] = val;
        });
      }
      setAnswers(initialAns);
      setAttachments(report.attachments || []);
    }
  }, [report]);

  const handleFieldChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
    // Clear error for field if fixed
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleDraftClick = async () => {
    try {
      setIsSavingDraft(true);
      await onSaveDraft(answers, attachments);
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ المسودة');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmitClick = () => {
    const fields = template.fields || [];
    const validation = validateReportAnswers(fields, answers);

    if (!validation.isValid) {
      setErrors(validation.errors);
      toastError('يرجى تعبئة كافة الحقول المطلوبة الإلزامية المشار إليها باللون الأحمر.');
      return;
    }

    // Open confirmation dialog
    setIsSubmitConfirmOpen(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      setIsSubmitConfirmOpen(false);
      await onSubmitReport(answers, attachments);
    } catch (err: any) {
      toastError(err.message || 'فشل رفع التقرير');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReturned = report?.status === 'returned';
  const latestReturnReview = isReturned && report?.reviews
    ? report.reviews.filter((r) => r.action === 'returned').slice(-1)[0]
    : null;

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Return Warning Banner */}
      {isReturned && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-800">
              تنبيه: التقرير تمت إعادته من قبل الإدارة لإجراء تعديلات
            </h4>
            {latestReturnReview?.comment ? (
              <p className="text-xs text-rose-700 mt-1 bg-white/80 p-2.5 rounded-lg border border-rose-200 leading-relaxed">
                <span className="font-bold">ملاحظات الإدارة: </span>
                {latestReturnReview.comment}
              </p>
            ) : (
              <p className="text-xs text-rose-700 mt-1">
                يرجى مراجعة وتعديل بيانات التقرير ثم الضغط على "رفع التقرير" مرة أخرى.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Report Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span>تقرير يوم: {formatArabicDate(reportDate)} (<span className="font-mono">{formatNumericDate(reportDate)}</span>)</span>
          <span className="text-slate-300">|</span>
          <span>الجهة: {unitName}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>القالب المعتمد: {template.name}</span>
        </div>
      </div>

      {/* Dynamic Fields Section */}
      <div className="flex flex-col gap-5">
        {(template.fields || []).map((field) => (
          <div key={field.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <DynamicFieldRenderer
              field={field}
              value={answers[field.id]}
              onChange={(val) => handleFieldChange(field.id, val)}
              error={errors[field.id]}
              disabled={loading || isSubmitting}
            />
          </div>
        ))}
      </div>

      {/* Attachments Section */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <AttachmentUploader
          reportId={report?.id}
          userId={userId}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          disabled={loading || isSubmitting}
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={handleDraftClick}
          loading={isSavingDraft}
          disabled={loading || isSubmitting}
          icon={<Save className="w-4 h-4" />}
        >
          حفظ كمسودة
        </Button>

        <Button
          type="button"
          variant="primary"
          className="w-full sm:w-auto"
          onClick={handleSubmitClick}
          loading={isSubmitting}
          disabled={loading || isSavingDraft}
          icon={<Send className="w-4 h-4" />}
        >
          {isReturned ? 'إعادة رفع التقرير للإدارة' : 'رفع التقرير للاعتماد'}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={handleConfirmedSubmit}
        title="تأكيد رفع التقرير اليومي"
        message="هل أنت متأكد من رفع التقرير اليومي للإدارة؟ بعد الرفع سيتم إرساله للمراجعة ولن تتمكن من تعديله إلا في حال إعادته من قبل الإدارة."
        confirmText="نعم، قم بالرفع الآن"
        cancelText="مراجعة التقرير"
        variant="primary"
        loading={isSubmitting}
      />
    </div>
  );
};
