import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { reportService } from '../../services/reportService';
import { DailyReport } from '../../types';
import { ReportDetailView } from '../../components/reports/ReportDetailView';
import { ReportPrintView } from '../../components/reports/ReportPrintView';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';
import { ArrowRight, AlertCircle, Printer } from 'lucide-react';
import { Link } from '../../components/common/Link';

export const ViewReportPage: React.FC<{ reportId: string }> = ({ reportId }) => {
  const { user, isAdmin, isSuperAdmin, isHospitalDirector } = useAuth();
  const { goBack } = useRouter();
  const { success, error: toastError } = useToast();

  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      const rep = await reportService.getReportById(reportId);
      setReport(rep);
    } catch (err: any) {
      toastError(err.message || 'فشل تحميل بيانات التقرير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const handleReturnReport = async (comment: string) => {
    if (!user) return;
    try {
      const updated = await reportService.returnReport(reportId, user.id, comment);
      setReport(updated);
      success('تمت إعادة التقرير للجهة مع إرفاق الملاحظات بنجاح.');
    } catch (err: any) {
      toastError(err.message || 'فشل إعادة التقرير');
    }
  };

  const handleCloseReport = async (comment?: string) => {
    if (!user) return;
    try {
      const updated = await reportService.closeReport(reportId, user.id, comment);
      setReport(updated);
      success('تم اعتماد التقرير وإغلاقه بنجاح.');
    } catch (err: any) {
      toastError(err.message || 'فشل إغلاق التقرير');
    }
  };

  if (loading) {
    return <Spinner size="lg" text="جارٍ تحميل تفاصيل التقرير..." />;
  }

  if (!report) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">التقرير غير موجود</h3>
          <p className="text-xs text-slate-500 mb-6">
            تعذر العثور على التقرير المطلوب، ربما تم حذفه أو ليس لديك الصلاحية لعرضه.
          </p>
          <Button variant="secondary" size="sm" onClick={() => goBack(isHospitalDirector ? '/admin' : '/dashboard')}>
            العودة للوحة التحكم
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === report.user_id || user?.profile.reporting_unit_id === report.reporting_unit_id;
  const canEdit = isOwner && (report.status === 'draft' || report.status === 'returned');
  const canReview = isAdmin || isSuperAdmin;

  return (
    <div className="flex flex-col gap-6 text-right max-w-4xl mx-auto">
      {/* Top Back Navigation (Screen Only) */}
      <div className="no-print flex items-center justify-between gap-4 pb-2">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={() => goBack(isHospitalDirector ? '/admin' : '/dashboard')}
        >
          {isHospitalDirector ? 'رجوع للوحة المتابعة' : 'رجوع للسابق'}
        </Button>
      </div>

      {/* Screen View */}
      <div className="no-print">
        <ReportDetailView
          report={report}
          canReview={canReview}
          canEdit={canEdit}
          onReturn={handleReturnReport}
          onCloseReport={handleCloseReport}
        />
      </div>

      {/* Dedicated Print View (Activated on @media print) */}
      <div className="hidden print-only">
        <ReportPrintView report={report} />
      </div>
    </div>
  );
};
