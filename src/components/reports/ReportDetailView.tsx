import React, { useState } from 'react';
import { DailyReport, Attachment } from '../../types';
import { ReportBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { ReviewTimeline } from './ReviewTimeline';
import { ReturnReportModal } from '../admin/ReturnReportModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatArabicDate, formatArabicDateTime, formatNumericDate } from '../../utils/dateUtils';
import { formatFileSize, isImageFile } from '../../utils/formatters';
import { storageService } from '../../services/storageService';
import { HOSPITAL_INFO } from '../../lib/constants';
import { ImagePreviewModal } from '../common/ImagePreviewModal';
import { 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  Building2, 
  User, 
  Calendar, 
  Clock, 
  Paperclip, 
  FileText, 
  FileImage,
  Eye,
  Download,
  FileEdit
} from 'lucide-react';
import { Link } from '../common/Link';

interface ReportDetailViewProps {
  report: DailyReport;
  canReview?: boolean;
  canEdit?: boolean;
  onReturn?: (comment: string) => Promise<void>;
  onCloseReport?: (comment?: string) => Promise<void>;
  onPrint?: () => void;
}

export const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  report,
  canReview = false,
  canEdit = false,
  onReturn,
  onCloseReport,
  onPrint
}) => {
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string; size?: number | null } | null>(null);

  const handleReturnSubmit = async (comment: string) => {
    if (!onReturn) return;
    try {
      setActionLoading(true);
      await onReturn(comment);
      setIsReturnModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseConfirm = async () => {
    if (!onCloseReport) return;
    try {
      setActionLoading(true);
      await onCloseReport('تمت المراجعة والاعتماد');
      setIsCloseConfirmOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileDownload = async (att: Attachment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const url = await storageService.getFileUrl(att.file_path);
      storageService.downloadFile(url, att.file_name);
    } catch {
      alert('فشل فتح المرفق');
    }
  };

  const handleAttachmentClick = async (att: Attachment) => {
    const isImg = isImageFile(att.file_name, att.file_type, att.file_path);
    try {
      const url = await storageService.getFileUrl(att.file_path);
      if (isImg) {
        setPreviewImage({
          url,
          name: att.file_name,
          size: att.file_size
        });
      } else {
        storageService.downloadFile(url, att.file_name);
      }
    } catch {
      alert('فشل عرض المرفق');
    }
  };

  const handlePrintTrigger = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Top Header Card */}
      <div className="glrs-card p-4 sm:p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src={HOSPITAL_INFO.logoUrl} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                تقرير {report.reporting_unit?.name || 'الجهة'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                {HOSPITAL_INFO.nameAr} - {HOSPITAL_INFO.systemName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
            <ReportBadge status={report.status} />

            <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrintTrigger}
                icon={<Printer className="w-4 h-4" />}
                className="flex-1 sm:flex-none justify-center"
              >
                طباعة / PDF
              </Button>

              {canEdit && (report.status === 'draft' || report.status === 'returned') && (
                <Link to={`/reports/${report.id}/edit`} className="flex-1 sm:flex-none">
                  <Button variant="primary" size="sm" icon={<FileEdit className="w-4 h-4" />} className="w-full justify-center">
                    تعديل التقرير
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">تاريخ التقرير:</span>
              <span className="font-bold text-slate-800 font-mono">{formatNumericDate(report.report_date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">الجهة / القسم:</span>
              <span className="font-bold text-slate-800">{report.reporting_unit?.name || '—'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <User className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">مُعد التقرير:</span>
              <span className="font-bold text-slate-800">{report.user?.full_name || '—'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">وقت الرفع:</span>
              <span className="font-bold text-slate-800">
                {report.submitted_at ? formatArabicDateTime(report.submitted_at) : 'لم يرفع بعد (مسودة)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Fields & Answers Section */}
      <div className="glrs-card p-6 border-slate-200">
        <h3 className="text-base font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          بيانات وإجابات النموذج ({report.template?.name || 'النموذج اليومي'})
        </h3>

        <div className="flex flex-col gap-4">
          {(report.template?.fields || []).map((field, idx) => {
            const answer = (report.answers || []).find((a) => a.field_id === field.id);
            let val = answer?.value;

            // Try JSON parse if array
            if (typeof val === 'string' && val.startsWith('[')) {
              try {
                val = JSON.parse(val);
              } catch {
                // keep string
              }
            }

            return (
              <div key={field.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">{field.field_label}</h4>
                </div>

                <div className="pr-7">
                  {val === undefined || val === null || val === '' ? (
                    <span className="text-xs text-slate-400 italic">لا توجد بيانات مدخلة</span>
                  ) : Array.isArray(val) ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {val.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-900 text-xs font-semibold"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : typeof val === 'boolean' ? (
                    <span className="text-xs font-bold text-slate-700">
                      {val ? '✓ نعم / منطبق' : '✗ لا'}
                    </span>
                  ) : field.field_type === 'date' && typeof val === 'string' ? (
                    <p className="text-xs font-mono font-bold text-slate-700">
                      {formatNumericDate(val)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {String(val)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attachments Section */}
      {report.attachments && report.attachments.length > 0 && (() => {
        const imageAttachments = report.attachments.filter((att) =>
          isImageFile(att.file_name, att.file_type, att.file_path)
        );
        const docAttachments = report.attachments.filter(
          (att) => !isImageFile(att.file_name, att.file_type, att.file_path)
        );

        return (
          <div className="glrs-card p-6 border-slate-200">
            <h3 className="text-base font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-emerald-600" />
                المرفقات الملحقة بالتقرير ({report.attachments.length})
              </span>
              <span className="text-xs font-normal text-slate-500">
                {imageAttachments.length > 0 && `${imageAttachments.length} صور`}
                {imageAttachments.length > 0 && docAttachments.length > 0 && ' • '}
                {docAttachments.length > 0 && `${docAttachments.length} مستندات`}
              </span>
            </h3>

            {/* Images Grid */}
            {imageAttachments.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <FileImage className="w-4 h-4 text-emerald-600" />
                  الصور المرفقة (اضغط للمعاينة أو التحميل):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imageAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="group relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col"
                      onClick={() => handleAttachmentClick(att)}
                    >
                      <div className="relative w-full h-32 bg-slate-200/70 overflow-hidden flex items-center justify-center">
                        <img
                          src={att.file_path}
                          alt={att.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="p-1.5 rounded-full bg-white/90 text-slate-800 shadow">
                            <Eye className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-white flex items-center justify-between gap-1 text-right">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate" title={att.file_name}>
                            {att.file_name}
                          </p>
                          <p className="text-[10px] text-slate-400">{formatFileSize(att.file_size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleFileDownload(att, e)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="تحميل الصورة"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Documents */}
            {docAttachments.length > 0 && (
              <div>
                {imageAttachments.length > 0 && (
                  <p className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-600" />
                    المستندات والملفات الأخرى:
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {docAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors cursor-pointer"
                      onClick={() => handleAttachmentClick(att)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-sky-50 text-sky-700 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 text-right">
                          <p className="text-xs font-bold text-slate-800 truncate" title={att.file_name}>
                            {att.file_name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatFileSize(att.file_size)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleFileDownload(att, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        title="تحميل"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Review History */}
      {report.reviews && report.reviews.length > 0 && (
        <div className="glrs-card p-6 border-slate-200">
          <ReviewTimeline reviews={report.reviews} />
        </div>
      )}

      {/* Reporter Edit Action Bar (When report needs edit/completion) */}
      {canEdit && (report.status === 'draft' || report.status === 'returned') && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-sm text-right">
          <div>
            <h4 className="text-sm font-bold text-amber-950">
              {report.status === 'returned' ? 'التقرير معاد للتعديل والمراجعة' : 'التقرير مسودة لم ترفع بعد'}
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              {report.status === 'returned'
                ? 'يرجى الاطلاع على الملاحظات الإدارية وتعديل البيانات ثم إعادة رفع التقرير للاعتماد.'
                : 'يمكنك تعديل واستكمال تعبئة البيانات ورفع التقرير لإدارة المستشفى.'}
            </p>
          </div>

          <Link to={`/reports/${report.id}/edit`} className="w-full sm:w-auto shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={<FileEdit className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center py-2.5 px-5 font-bold shadow-sm"
            >
              تعديل واستكمال التقرير
            </Button>
          </Link>
        </div>
      )}

      {/* Admin Action Bar (Review & Decisions) */}
      {canReview && report.status === 'submitted' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <h4 className="text-sm font-bold">إجراءات المراجعة والاعتماد الإداري</h4>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              يمكنك اعتماد التقرير وإغلاقه نهائياً، أو إعادته للجهة مع توضيح أسباب وملاحظات الإعادة.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsReturnModalOpen(true)}
              icon={<RotateCcw className="w-4 h-4" />}
              loading={actionLoading}
              className="w-full sm:w-auto justify-center py-2.5 px-4 font-bold shadow-sm"
            >
              إعادة للتعديل مع ملاحظة
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCloseConfirmOpen(true)}
              icon={<CheckCircle2 className="w-4 h-4" />}
              loading={actionLoading}
              className="w-full sm:w-auto justify-center py-2.5 px-4 font-bold shadow-sm"
            >
              اعتماد وإغلاق التقرير
            </Button>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <ReturnReportModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleReturnSubmit}
        loading={actionLoading}
      />

      {/* Close Confirm */}
      <ConfirmDialog
        isOpen={isCloseConfirmOpen}
        onClose={() => setIsCloseConfirmOpen(false)}
        onConfirm={handleCloseConfirm}
        title="تأكيد اعتماد وإغلاق التقرير"
        message="هل أنت متأكد من اعتماد التقرير اليومي وإغلاقه؟ بعد الإغلاق سيتم تثبيت البيانات ولن يتمكن معد التقرير من تعديله."
        confirmText="نعم، اعتمد وأغلق التقرير"
        cancelText="تراجع"
        variant="primary"
        loading={actionLoading}
      />

      {/* Image Lightbox Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          isOpen={Boolean(previewImage)}
          imageUrl={previewImage.url}
          fileName={previewImage.name}
          fileSize={previewImage.size}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
