import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/reportService';
import { DailyReport } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ReportBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Link } from '../../components/common/Link';
import { formatArabicDate, formatArabicDateTime, formatNumericDate, getTodayDateString } from '../../utils/dateUtils';
import { 
  PlusCircle, 
  FileEdit, 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Calendar, 
  FileText, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export const ReporterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayReport, setTodayReport] = useState<DailyReport | null>(null);
  const [recentReports, setRecentReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = getTodayDateString();
  const unit = user?.profile?.reporting_unit;

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!unit?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 1. Get today's report for this unit
        const report = await reportService.getUnitReportByDate(unit.id, todayStr);
        setTodayReport(report);

        // 2. Get recent reports for this unit
        const allUnitReports = await reportService.getReports({ unitId: unit.id });
        setRecentReports(allUnitReports.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [unit?.id, todayStr]);

  if (loading) {
    return <Spinner size="lg" text="جارٍ تحميل لوحة التحكم الخاصة بجهتك..." />;
  }

  // Calculate quick stats
  const submittedCount = recentReports.filter((r) => r.status === 'submitted' || r.status === 'closed').length;
  const returnedCount = recentReports.filter((r) => r.status === 'returned').length;
  const draftCount = recentReports.filter((r) => r.status === 'draft').length;

  const renderTodayAction = () => {
    if (!todayReport) {
      return (
        <Link to="/reports/new">
          <Button variant="primary" size="lg" icon={<PlusCircle className="w-5 h-5" />}>
            إنشاء تقرير اليوم الآن
          </Button>
        </Link>
      );
    }

    switch (todayReport.status) {
      case 'draft':
        return (
          <Link to={`/reports/${todayReport.id}/edit`}>
            <Button variant="blue" size="lg" icon={<FileEdit className="w-5 h-5" />}>
              متابعة واستكمال تحرير المسودة
            </Button>
          </Link>
        );
      case 'returned':
        return (
          <Link to={`/reports/${todayReport.id}/edit`}>
            <Button variant="danger" size="lg" icon={<RotateCcw className="w-5 h-5" />}>
              تعديل التقرير المطلوب وإعادة الرفع
            </Button>
          </Link>
        );
      case 'submitted':
      case 'closed':
      default:
        return (
          <Link to={`/reports/${todayReport.id}`}>
            <Button variant="secondary" size="lg" icon={<Eye className="w-5 h-5" />}>
              عرض تفاصيل التقرير والطباعة
            </Button>
          </Link>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Welcome & Info Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-sky-900 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
                معد التقارير
              </span>
              <span className="text-xs text-emerald-200">
                {unit?.name || 'الجهة غير محددة'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              مرحباً، {user?.profile.full_name}
            </h2>
            <p className="text-xs text-slate-200 mt-1">
              النظام الإلكتروني لإدارة التقارير اليومية بمستشفى اللواء الأخضر الدولي
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs">
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span className="font-bold">{formatArabicDate(todayStr)}</span>
          </div>
        </div>
      </div>

      {/* Today's Report Highlight Card */}
      <Card className="p-4 sm:p-6 border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              حالة تقرير اليوم ({formatArabicDate(todayStr)})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة إعداد ورفع التقرير اليومي لـ {unit?.name}
            </p>
          </div>

          <div>
            {todayReport ? (
              <ReportBadge status={todayReport.status} />
            ) : (
              <span className="status-badge badge-unsubmitted">لم يتم إنشاء تقرير اليوم بعد</span>
            )}
          </div>
        </div>

        {todayReport?.status === 'returned' && (
          <div className="p-4 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              تنبيه من إدارة المستشفى:
            </p>
            <p className="mt-1 leading-relaxed">
              تمت إعادة التقرير من قبل الإدارة مع ملاحظات. يرجى الضغط على زر التعديل أدناه لمعالجة
              الملاحظات وإعادة الإرسال.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-600">
            {todayReport ? (
              <span>
                آخر تحديث:{' '}
                <strong>{formatArabicDateTime(todayReport.updated_at || todayReport.created_at)}</strong>
              </span>
            ) : (
              <span className="text-amber-700 font-semibold">
                ⚠ لم تقم برفع التقرير اليومي حتى الآن. يرجى المبادرة برفعه لتفادي التأخير.
              </span>
            )}
          </div>

          <div>{renderTodayAction()}</div>
        </div>
      </Card>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">تقارير مكتملة ومرفوعة</p>
              <h4 className="text-2xl font-black text-slate-800 mt-1">{submittedCount}</h4>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">مسودات قيد الإعداد</p>
              <h4 className="text-2xl font-black text-slate-800 mt-1">{draftCount}</h4>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <FileEdit className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">تقارير معادة للتعديل</p>
              <h4 className="text-2xl font-black text-slate-800 mt-1">{returnedCount}</h4>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700">
              <RotateCcw className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Reports List */}
      <Card className="p-4 sm:p-6 border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            آخر تقارير {unit?.name || 'الجهة'}
          </h3>

          <Link to="/my-reports">
            <Button variant="ghost" size="sm">
              عرض كافة التقارير السابقة ←
            </Button>
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            لا توجد تقارير مسجلة حتى الآن.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {recentReports.map((rep) => (
              <div
                key={rep.id}
                className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      تقرير يوم: <span className="font-mono">{formatNumericDate(rep.report_date)}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {rep.submitted_at
                        ? `تم الرفع: ${formatArabicDateTime(rep.submitted_at)}`
                        : 'مسودة لم ترفع بعد'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ReportBadge status={rep.status} />

                  <Link to={`/reports/${rep.id}`}>
                    <Button variant="secondary" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                      عرض
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
