import React, { useState, useEffect, useMemo, useRef } from 'react';
import { reportService } from '../../services/reportService';
import { unitService } from '../../services/unitService';
import { DailyReport, ReportingUnit } from '../../types';
import { ReportBadge, UnitTypeBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatArabicDate, formatArabicDateTime } from '../../utils/dateUtils';
import { 
  Layers, 
  Search, 
  Calendar, 
  Eye, 
  Building2, 
  User, 
  Clock, 
  Filter,
  Printer
} from 'lucide-react';
import { Link } from '../../components/common/Link';

export const AllReportsPage: React.FC = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [units, setUnits] = useState<ReportingUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    try {
      input.showPicker();
    } catch {
      input.click();
    }
  };

  useEffect(() => {
    const loadAllReportsData = async () => {
      try {
        setLoading(true);
        const [repList, unitList] = await Promise.all([
          reportService.getReports(),
          unitService.getUnits()
        ]);
        setReports(repList);
        setUnits(unitList);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAllReportsData();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchSearch =
        (rep.reporting_unit?.name &&
          rep.reporting_unit.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rep.user?.full_name &&
          rep.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rep.report_date.includes(searchTerm);

      const matchDate = !selectedDate || rep.report_date === selectedDate;
      const matchUnit = selectedUnitId === 'all' || rep.reporting_unit_id === selectedUnitId;
      const matchStatus = selectedStatus === 'all' || rep.status === selectedStatus;

      return matchSearch && matchDate && matchUnit && matchStatus;
    });
  }, [reports, searchTerm, selectedDate, selectedUnitId, selectedStatus]);

  if (loading) {
    return <Spinner size="lg" text="جارٍ استعراض كافة تقارير المستشفى..." />;
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            أرشيف كافة تقارير مستشفى اللواء الأخضر الدولي
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            البحث المتقدم، الفلترة حسب التاريخ والجهة والحالة، واستخراج التقارير الرسمية
          </p>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-4">
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="بحث بالجهة أو اسم معد التقرير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glrs-input search-input filter-control h-11"
            />
          </div>

          {/* Date Picker */}
          <div className="relative lg:col-span-2">
            <button type="button" className="date-filter-display" onClick={openDatePicker}>
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{selectedDate ? formatArabicDate(selectedDate) : 'اختر التاريخ'}</span>
            </button>
            <input
              ref={dateInputRef}
              type="date"
              dir="ltr"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-filter-native"
              aria-label="اختر تاريخ التقرير"
              title="فلترة بالتاريخ"
            />
          </div>

          {/* Unit Filter */}
          <div className="lg:col-span-4">
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="glrs-select filter-control h-11"
            >
              <option value="all">جميع الجهات والأقسام</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="glrs-select filter-control h-11"
            >
              <option value="all">جميع الحالات</option>
              <option value="submitted">مرفوع (قيد المراجعة)</option>
              <option value="closed">معتمد ومغلق</option>
              <option value="returned">معاد للتعديل</option>
              <option value="draft">مسودة</option>
            </select>
          </div>
        </div>

        {(searchTerm || selectedDate || selectedUnitId !== 'all' || selectedStatus !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>النتائج المطابقة: {filteredReports.length} تقرير</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDate('');
                setSelectedUnitId('all');
                setSelectedStatus('all');
              }}
              className="text-emerald-700 hover:underline font-bold"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">تاريخ التقرير</th>
              <th className="p-3.5">الجهة / القسم</th>
              <th className="p-3.5">مُعد التقرير</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5">وقت الرفع</th>
              <th className="p-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  لا توجد تقارير مطابقة للفلاتر المحددة.
                </td>
              </tr>
            ) : (
              filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>{formatArabicDate(rep.report_date)}</span>
                    </div>
                  </td>

                  <td className="p-3.5 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-600" />
                      <span>{rep.reporting_unit?.name || '—'}</span>
                    </div>
                  </td>

                  <td className="p-3.5 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rep.user?.full_name || '—'}</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <ReportBadge status={rep.status} />
                  </td>

                  <td className="p-3.5 text-slate-500">
                    {rep.submitted_at ? formatArabicDateTime(rep.submitted_at) : 'مسودة'}
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/admin/reports/${rep.id}`}>
                        <Button variant="secondary" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                          عرض ومراجعة
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredReports.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            لا توجد تقارير مطابقة
          </div>
        ) : (
          filteredReports.map((rep) => (
            <div key={rep.id} className="glrs-card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {rep.reporting_unit?.name || 'الجهة'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    تاريخ: {formatArabicDate(rep.report_date)}
                  </p>
                </div>
                <ReportBadge status={rep.status} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span>المعد: {rep.user?.full_name}</span>
                <span>{rep.submitted_at ? formatArabicDateTime(rep.submitted_at) : 'مسودة'}</span>
              </div>

              <div className="pt-2">
                <Link to={`/admin/reports/${rep.id}`}>
                  <Button variant="secondary" size="sm" className="w-full" icon={<Eye className="w-3.5 h-3.5" />}>
                    عرض ومراجعة التقرير
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
