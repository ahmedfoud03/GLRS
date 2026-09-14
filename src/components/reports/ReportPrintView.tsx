import React from 'react';
import { DailyReport } from '../../types';
import { HOSPITAL_INFO } from '../../lib/constants';
import { formatArabicDate, formatArabicDateTime } from '../../utils/dateUtils';
import { REPORT_STATUSES } from '../../lib/constants';
import { formatFileSize, isImageFile } from '../../utils/formatters';

interface ReportPrintViewProps {
  report: DailyReport;
}

export const ReportPrintView: React.FC<ReportPrintViewProps> = ({ report }) => {
  const statusInfo = REPORT_STATUSES[report.status] || { label: report.status };

  return (
    <div className="print-page bg-white p-8 text-black text-right font-cairo">
      {/* Official Hospital Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
        <div className="text-right">
          <h1 className="text-xl font-black text-slate-900 leading-tight">
            {HOSPITAL_INFO.nameAr}
          </h1>
          {HOSPITAL_INFO.taglineAr && (
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {HOSPITAL_INFO.taglineAr}
            </p>
          )}
          <p className="text-[11px] text-slate-600 mt-0.5">{HOSPITAL_INFO.city}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">هاتف: {HOSPITAL_INFO.contactPhone}</p>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={HOSPITAL_INFO.logoUrl}
            alt="Hospital Logo"
            className="w-20 h-20 object-contain"
          />
          <span className="text-[10px] font-bold text-slate-700 mt-1 uppercase tracking-wider">
            GLRS REPORT
          </span>
        </div>

        <div className="text-left" dir="ltr">
          <h2 className="text-sm font-black text-slate-900 leading-tight">
            {HOSPITAL_INFO.nameEn}
          </h2>
          {HOSPITAL_INFO.taglineEn && (
            <p className="text-[10px] text-slate-600 font-medium">
              {HOSPITAL_INFO.taglineEn}
            </p>
          )}
          <p className="text-[10px] text-slate-500 mt-0.5">{HOSPITAL_INFO.cityEn}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Tel: {HOSPITAL_INFO.contactPhone}</p>
        </div>
      </div>

      {/* Report Title Bar */}
      <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center mb-6">
        <h2 className="text-base font-black text-slate-900">
          التقرير اليومي - {report.reporting_unit?.name || 'الجهة'}
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          النموذج: {report.template?.name || 'النموذج المعتمد'}
        </p>
      </div>

      {/* Metadata Table */}
      <table className="w-full border-collapse border border-slate-400 text-xs mb-6">
        <tbody>
          <tr>
            <td className="border border-slate-400 bg-slate-100 p-2 font-bold w-1/4">
              تاريخ التقرير:
            </td>
            <td className="border border-slate-400 p-2 w-1/4">
              {formatArabicDate(report.report_date)}
            </td>
            <td className="border border-slate-400 bg-slate-100 p-2 font-bold w-1/4">
              الجهة / القسم:
            </td>
            <td className="border border-slate-400 p-2 w-1/4">
              {report.reporting_unit?.name || '—'}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 bg-slate-100 p-2 font-bold">
              مُعد التقرير:
            </td>
            <td className="border border-slate-400 p-2">
              {report.user?.full_name || '—'}
            </td>
            <td className="border border-slate-400 bg-slate-100 p-2 font-bold">
              حالة التقرير:
            </td>
            <td className="border border-slate-400 p-2 font-bold">
              {statusInfo.label}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 bg-slate-100 p-2 font-bold">
              وقت الرفع:
            </td>
            <td className="border border-slate-400 p-2">
              {report.submitted_at ? formatArabicDateTime(report.submitted_at) : '—'}
            </td>
            <td className="border border-slate-400 bg-slate-100 p-2 font-bold">
              وقت الاعتماد / الإغلاق:
            </td>
            <td className="border border-slate-400 p-2">
              {report.closed_at ? formatArabicDateTime(report.closed_at) : '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Report Answers Section */}
      <div className="flex flex-col gap-4 mb-6">
        <h3 className="text-sm font-bold border-b border-slate-300 pb-1 text-slate-800">
          تفاصيل التقرير والبيانات اليومية:
        </h3>

        <div className="flex flex-col gap-3">
          {(report.template?.fields || []).map((field, idx) => {
            const answer = (report.answers || []).find((a) => a.field_id === field.id);
            let val = answer?.value;

            if (typeof val === 'string' && val.startsWith('[')) {
              try {
                val = JSON.parse(val);
              } catch {
                // keep string
              }
            }

            return (
              <div
                key={field.id}
                className="border border-slate-300 rounded p-3 print-break-inside-avoid"
              >
                <div className="font-bold text-xs text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{field.field_label}</span>
                </div>
                <div className="pr-6 text-xs text-slate-800">
                  {val === undefined || val === null || val === '' ? (
                    <span className="text-slate-400 italic">لا توجد بيانات</span>
                  ) : Array.isArray(val) ? (
                    <span>{val.join(' ، ')}</span>
                  ) : typeof val === 'boolean' ? (
                    <span>{val ? 'نعم / منطبق' : 'لا'}</span>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{String(val)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Notes Section */}
      {report.reviews && report.reviews.length > 0 && (
        <div className="border border-slate-300 rounded p-3 mb-6 print-break-inside-avoid">
          <h4 className="text-xs font-bold text-slate-900 mb-2">
            ملاحظات وقرارات الإدارة والمراجعة:
          </h4>
          {report.reviews.map((rev) => (
            <div key={rev.id} className="text-xs text-slate-700 mb-2 last:mb-0">
              <span className="font-semibold">{rev.reviewer?.full_name}: </span>
              <span>{rev.comment || 'تمت المراجعة'}</span>
              <span className="text-[10px] text-slate-500 mr-2">
                ({formatArabicDateTime(rev.created_at)})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Attachments & Attached Photos Section for Official Print */}
      {report.attachments && report.attachments.length > 0 && (() => {
        const imageAttachments = report.attachments.filter((att) =>
          isImageFile(att.file_name, att.file_type, att.file_path)
        );
        const docAttachments = report.attachments.filter(
          (att) => !isImageFile(att.file_name, att.file_type, att.file_path)
        );

        return (
          <div className="flex flex-col gap-4 mb-6">
            <h3 className="text-sm font-bold border-b border-slate-300 pb-1 text-slate-800">
              المرفقات والوثائق المساندة الملحقة ({report.attachments.length}):
            </h3>

            {/* Attached Photos Print Section */}
            {imageAttachments.length > 0 && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-slate-700">
                  الصور والوثائق المصورة المرفقة ({imageAttachments.length}):
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {imageAttachments.map((att, idx) => (
                    <div
                      key={att.id || idx}
                      className="border border-slate-300 rounded-lg p-2.5 bg-white print-break-inside-avoid flex flex-col"
                    >
                      <div className="w-full h-64 flex items-center justify-center bg-slate-50 border border-slate-200 rounded mb-2 overflow-hidden">
                        <img
                          src={att.file_path}
                          alt={att.file_name}
                          className="max-h-64 max-w-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-700 pt-1 border-t border-slate-100">
                        <span className="font-bold truncate max-w-[70%]" title={att.file_name}>
                          {idx + 1}. {att.file_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Attachments Table */}
            {docAttachments.length > 0 && (
              <div className="print-break-inside-avoid mt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-2">
                  المستندات والملفات المرفقة ({docAttachments.length}):
                </h4>
                <table className="w-full border-collapse border border-slate-400 text-xs text-right">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-400 p-2 font-bold w-12 text-center">#</th>
                      <th className="border border-slate-400 p-2 font-bold">اسم المستند / الملف</th>
                      <th className="border border-slate-400 p-2 font-bold w-28 text-center">الحجم</th>
                      <th className="border border-slate-400 p-2 font-bold w-36 text-center">تاريخ الإرفاق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docAttachments.map((att, idx) => (
                      <tr key={att.id || idx}>
                        <td className="border border-slate-400 p-2 text-center font-medium">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-400 p-2 font-semibold text-slate-800">
                          {att.file_name}
                        </td>
                        <td className="border border-slate-400 p-2 text-center text-slate-600">
                          {formatFileSize(att.file_size)}
                        </td>
                        <td className="border border-slate-400 p-2 text-center text-slate-600">
                          {att.created_at ? formatArabicDateTime(att.created_at) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}


    </div>
  );
};
