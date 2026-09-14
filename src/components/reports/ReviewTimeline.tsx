import React from 'react';
import { ReportReview } from '../../types';
import { formatArabicDateTime } from '../../utils/dateUtils';
import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

export const ReviewTimeline: React.FC<{ reviews: ReportReview[] }> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 text-right">
      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
        <MessageSquare className="w-4 h-4 text-sky-600" />
        سجل المراجعات الإدارية والقرارات
      </h4>

      <div className="flex flex-col gap-2.5">
        {reviews.map((rev) => {
          const isReturned = rev.action === 'returned';
          const isClosed = rev.action === 'closed';

          return (
            <div
              key={rev.id}
              className={`p-3.5 rounded-xl border ${
                isReturned
                  ? 'bg-rose-50/70 border-rose-200 text-slate-800'
                  : isClosed
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {isReturned ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      <AlertCircle className="w-3.5 h-3.5" />
                      إعادة للتعديل
                    </span>
                  ) : isClosed ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      اعتماد وإغلاق التقرير
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-700">مراجعة إدارية</span>
                  )}
                  <span className="text-xs font-semibold text-slate-700">
                    {rev.reviewer?.full_name || 'إدارة المستشفى'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">{formatArabicDateTime(rev.created_at)}</span>
              </div>

              {rev.comment ? (
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-200/60 mt-1">
                  {rev.comment}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic mt-1">تم الإجراء بدون ملاحظات إضافية.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
