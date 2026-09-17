import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/reportService';
import { UnsubmittedUnitInfo, AdminStatsSummary } from '../../types';
import { StatsOverview } from '../../components/admin/StatsOverview';
import { DailyTrackerTable } from '../../components/admin/DailyTrackerTable';
import { ReturnReportModal } from '../../components/admin/ReturnReportModal';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';
import { formatArabicDate, formatNumericDate, getTodayDateString } from '../../utils/dateUtils';
import { 
  FileCheck2, 
  Calendar, 
  RefreshCw, 
  HelpCircle, 
  Layers,
  ArrowRight,
  Printer
} from 'lucide-react';
import { Link } from '../../components/common/Link';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [trackerData, setTrackerData] = useState<UnsubmittedUnitInfo[]>([]);
  const [stats, setStats] = useState<AdminStatsSummary>({
    totalActiveUnits: 0,
    totalSubmittedToday: 0,
    totalUnsubmittedToday: 0,
    totalReturnedToday: 0,
    totalClosedToday: 0,
    totalDraftsToday: 0,
    submissionRate: 0
  });

  const [loading, setLoading] = useState(true);
  const [returningReportId, setReturningReportId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tracker, calculatedStats] = await Promise.all([
        reportService.getUnsubmittedTracker(selectedDate),
        reportService.getAdminDailyStats(selectedDate)
      ]);
      setTrackerData(tracker);
      setStats(calculatedStats);
    } catch (err: any) {
      toastError(err.message || 'فشل تحميل بيانات المتابعة اليومية');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickReturn = (reportId: string) => {
    setReturningReportId(reportId);
  };

  const handleReturnSubmit = async (comment: string) => {
    if (!returningReportId || !user) return;
    try {
      setActionLoading(true);
      await reportService.returnReport(returningReportId, user.id, comment);
      success('تمت إعادة التقرير للجهة وتحديث الحالة بنجاح.');
      setReturningReportId(null);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'فشل إعادة التقرير');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickClose = async (reportId: string) => {
    if (!user) return;
    try {
      await reportService.closeReport(reportId, user.id, 'تمت المراجعة والاعتماد');
      success('تم اعتماد التقرير وإغلاقه بنجاح.');
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'فشل اعتماد التقرير');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right">
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-sky-900 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold mb-2">
              {user?.profile.role === 'admin' ? 'مدير عام المستشفى' : 'المسؤول التقني عن المستشفى'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black">مرحباً، {user?.profile.full_name}</h2>
            <p className="text-xs text-slate-200 mt-1">
              {user?.profile.role === 'admin'
                ? 'لوحة المتابعة الإدارية الشاملة والرقابة على كافة تقارير الأقسام والجهات اليومية.'
                : 'لوحة التحكم والمتابعة الشاملة للنظام وقسمي تقنية المعلومات والتسويق.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs">
            <Calendar className="w-4 h-4 text-emerald-300" />
            <span className="font-bold">{formatArabicDate(selectedDate)} (<span className="font-mono">{formatNumericDate(selectedDate)}</span>)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            متابعة تقارير اليوم
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">اختر تاريخ المتابعة ثم راجع حالة تقارير جميع الأقسام.</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="flex flex-1 sm:flex-none items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
            <Calendar className="w-4 h-4 text-emerald-600 mr-1" />
            <span className="text-slate-500 font-bold">تاريخ المتابعة:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={loadData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            title="تحديث البيانات"
          >
            تحديث
          </Button>
        </div>
      </div>

      {loading ? (
        <Spinner size="lg" text="جارٍ جلب إحصائيات وتقارير الجهات..." />
      ) : (
        <>
          {/* Daily Stats Overview */}
          <StatsOverview stats={stats} dateLabel={formatArabicDate(selectedDate)} />

          {/* Daily Follow-Up Table */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">
                جدول متابعة اليوم لجميع الجهات ({trackerData.length} جهة)
              </h3>

              <div className="flex items-center gap-2">
                <Link to="/admin/unsubmitted">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold"
                    icon={<HelpCircle className="w-3.5 h-3.5" />}
                  >
                    كشف الجهات المتأخرة ({stats.totalUnsubmittedToday})
                  </Button>
                </Link>
              </div>
            </div>

            <DailyTrackerTable
              trackerData={trackerData}
              onQuickReturn={handleQuickReturn}
              onQuickClose={handleQuickClose}
              loading={actionLoading}
            />
          </div>
        </>
      )}

      {/* Return Modal */}
      <ReturnReportModal
        isOpen={Boolean(returningReportId)}
        onClose={() => setReturningReportId(null)}
        onSubmit={handleReturnSubmit}
        loading={actionLoading}
      />
    </div>
  );
};
