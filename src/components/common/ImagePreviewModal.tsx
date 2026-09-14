import React, { useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, FileImage } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { formatFileSize } from '../../utils/formatters';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string;
  fileName: string;
  fileSize?: number | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageUrl,
  fileName,
  fileSize,
  onClose
}) => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setIsZoomed(false);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.downloadFile(imageUrl, fileName || 'attached-image.jpg');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md text-white animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar Controls */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800/80 shrink-0 select-none"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-1">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <FileImage className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-100 truncate max-w-[200px] sm:max-w-md">
              {fileName}
            </h3>
            {fileSize && (
              <p className="text-[11px] text-slate-400">
                {formatFileSize(fileSize)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={() => setIsZoomed((prev) => !prev)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title={isZoomed ? 'تصغير' : 'تكبير'}
            aria-label="Toggle zoom"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            title="تحميل الصورة"
            aria-label="Download image"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">تحميل</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="إغلاق (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Display Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto">
        <div
          className={`relative max-w-full max-h-full transition-all duration-200 ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed((prev) => !prev);
          }}
        >
          <img
            src={imageUrl}
            alt={fileName}
            className="max-h-[80vh] sm:max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl mx-auto ring-1 ring-white/10"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
