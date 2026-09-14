import React, { useRef, useState } from 'react';
import { Attachment } from '../../types';
import { storageService } from '../../services/storageService';
import { formatFileSize, isImageFile } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';
import { Paperclip, Trash2, FileText, Download, Loader2, Plus, FileImage, Eye } from 'lucide-react';
import { Button } from '../common/Button';
import { ImagePreviewModal } from '../common/ImagePreviewModal';

interface AttachmentUploaderProps {
  reportId?: string;
  userId: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  reportId,
  userId,
  attachments,
  onAttachmentsChange,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string; size?: number | null } | null>(null);
  const { success, error } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Max file size: 15MB
    if (file.size > 15 * 1024 * 1024) {
      error('حجم الملف كبير جداً. الحد الأقصى المسموح به هو 15 ميجابايت.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploading(true);
      const repId = reportId || 'temp-draft-' + Date.now();
      const uploaded = await storageService.uploadFile(repId, file, userId);
      onAttachmentsChange([...attachments, uploaded]);
      success('تم رفع المرفق بنجاح');
    } catch (err: any) {
      error(err.message || 'حدث خطأ أثناء رفع المرفق');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (att: Attachment) => {
    try {
      await storageService.deleteAttachment(att.id, att.file_path);
      onAttachmentsChange(attachments.filter((a) => a.id !== att.id));
      success('تم حذف المرفق');
    } catch (err: any) {
      error(err.message || 'فشل حذف المرفق');
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
      error('فشل فتح رابط المرفق');
    }
  };

  const handleDownloadOnly = async (att: Attachment, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = await storageService.getFileUrl(att.file_path);
      storageService.downloadFile(url, att.file_name);
    } catch {
      error('فشل تحميل الملف');
    }
  };

  return (
    <div className="flex flex-col gap-3 text-right">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <Paperclip className="w-4 h-4 text-emerald-600" />
          المرفقات والوثائق المساندة (صور / تقارير PDF / وثائق)
        </label>
        {!disabled && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            إضافة مرفق
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
      />

      {uploading && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" />
          جارٍ رفع الملف وتأمينه سحابياً...
        </div>
      )}

      {attachments.length === 0 && !uploading && (
        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-slate-50/50">
          لا توجد مرفقات ملحقة بهذا التقرير حتى الآن.
        </div>
      )}

      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {attachments.map((att) => {
            const isImg = isImageFile(att.file_name, att.file_type, att.file_path);
            return (
              <div
                key={att.id}
                className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors shadow-sm"
              >
                <div
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                  onClick={() => handleAttachmentClick(att)}
                >
                  {isImg ? (
                    <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={att.file_path}
                        alt={att.file_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 text-right">
                    <p className="text-xs font-bold text-slate-800 truncate" title={att.file_name}>
                      {att.file_name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatFileSize(att.file_size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadOnly(att, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title={isImg ? 'تحميل الصورة' : 'تحميل الملف'}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleDelete(att)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
