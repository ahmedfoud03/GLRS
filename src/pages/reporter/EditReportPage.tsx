import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { reportService } from '../../services/reportService';
import { DailyReport, ReportTemplate, Attachment } from '../../types';
import { DynamicReportForm } from '../../components/reports/DynamicReportForm';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';
import { formatArabicDate } from '../../utils/dateUtils';
import { ArrowRight, FileEdit, AlertCircle } from 'lucide-react';
import { Link } from '../../components/common/Link';

export const EditReportPage: React.FC<{ reportId: string }> = ({ reportId }) => {
  const { user } = useAuth();
  const { navigate, goBack } = useRouter();
  const { success, error: toastError } = useToast();

  const [report, setReport] = useState<DailyReport | null>(null);
  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const rep = await reportService.getReportById(reportId);
        if (!rep) {
          toastError('لم يتم العثور على التقرير المطلوب');
          return;
        }

        // Check editable status
        if (rep.status === 'closed') {
          toastError('لا يمكن تعديل هذا التقرير لأنه معتمد ومغلق نهائياً.');
          navigate(`/reports/${reportId}`);
          return;
        }

        setReport(rep);
        setTemplate(rep.template || null);
      } catch (err: any) {
        toastError(err.message || 'فشل تحميل التقرير');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      loadReportData();
    }
  }, [reportId, navigate]);

  const handleSaveDraft = async (answers: Record<string, any>, attachments: Attachment[]) => {
    if (!report || !template || !user) return;
    try {
      setActionLoading(true);
      const saved = await reportService.saveReport({
        reportId: report.id,
        userId: user.id,
        unitId: report.reporting_unit_id,
        templateId: template.id,
        reportDate: report.report_date,
        answers,
        status: 'draft',
        attachments
      });
      setReport(saved);
      success('تم حفظ التعديلات كمسودة بنجاح.');
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ المسودة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReport = async (answers: Record<string, any>, attachments: Attachment[]) => {
    if (!report || !template || !user) return;
    try {
      setActionLoading(true);
      const saved = await reportService.saveReport({
        reportId: report.id,
        userId: user.id,
        unitId: report.reporting_unit_id,
        templateId: template.id,
        reportDate: report.report_date,
        answers,
        status: 'submitted',
        attachments
      });
      success('تم إعادة رفع التقرير للإدارة بنجاح.');
      navigate(`/reports/${saved.id}`);
    } catch (err: any) {
      toastError(err.message || 'فشل رفع التقرير');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" text="جارٍ استرجاع بيانات التقرير..." />;
  }

  if (!report || !template) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">التقرير غير متاح</h3>
          <p className="text-xs text-slate-500 mb-6">
            تعذر العثور على التقرير أو قالب البيانات الخاص به.
          </p>
          <Button variant="secondary" size="sm" onClick={() => goBack('/dashboard')}>
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-right max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileEdit className="w-6 h-6 text-emerald-600" />
            تعديل التقرير اليومي - {report.reporting_unit?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تاريخ التقرير: {formatArabicDate(report.report_date)}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={() => goBack(`/reports/${report.id}`)}
        >
          رجوع لعرض التقرير
        </Button>
      </div>

      <DynamicReportForm
        template={template}
        report={report}
        reportDate={report.report_date}
        userId={user!.id}
        unitId={report.reporting_unit_id}
        unitName={report.reporting_unit?.name || 'الجهة'}
        onSaveDraft={handleSaveDraft}
        onSubmitReport={handleSubmitReport}
        loading={actionLoading}
      />
    </div>
  );
};
