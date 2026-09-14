import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportService } from '../../services/reportService';
import { DailyReport } from '../../types';
import { ReportBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatArabicDate, formatArabicDateTime } from '../../utils/dateUtils';
import { 
  FileText, 
  Search, 
  Calendar, 
  Eye, 
  FileEdit, 
  Clock, 
  PlusCircle,
  Filter
} from 'lucide-react';
import { Link } from '../../components/common/Link';

const IT_UNIT_ID = '88888888-8888-8888-8888-888888888888';
const MKT_UNIT_ID = '10101010-1010-1010-1010-101010101010';

export const MyReportsPage: React.FC = () => {
  const { user, isSuperAdmin, isHospitalDirector } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');

  const unit = user?.profile?.reporting_unit;

  useEffect(() => {
    const loadReports = async () => {
      if (isHospitalDirector) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        if (isSuperAdmin) {
          // Super admin: load reports for IT and Marketing departments
          const allReports = await reportService.getReports();
          const itAndMktReports = allReports.filter(
            (r) => r.reporting_unit_id === IT_UNIT_ID || r.reporting_unit_id === MKT_UNIT_ID || r.user_id === user?.id
          );
          setReports(itAndMktReports);
        } else if (unit?.id) {
          const data = await reportService.getReports({ unitId: unit.id });
          setReports(data);
        } else {
          setReports([]);
        }
      } catch (err) {
        console.error('Failed to load my reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [unit?.id, isSuperAdmin, isHospitalDirector, user?.id]);

  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchStatus = statusFilter === 'all' || rep.status === statusFilter;
      const matchUnit = unitFilter === 'all' || rep.reporting_unit_id === unitFilter;
      const matchSearch =
        rep.report_date.includes(searchTerm) ||
        (rep.reporting_unit?.name && rep.reporting_unit.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rep.template?.name && rep.template.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchStatus && matchUnit && matchSearch;
    });
  }, [reports, searchTerm, statusFilter, unitFilter]);

  if (isHospitalDirector) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center text-right">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">أرشيف تقارير المستشفى</h3>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            بصفتك مديراً عاماً للمستشفى، يمكنك الاطلاع على أرشيف كافة التقارير المرفوعة من جميع الأقسام.
          </p>
          <Link to="/admin/reports">
            <Button variant="primary" size="sm">
              الانتقال إلى جميع تقارير المستشفى
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Spinner size="lg" text="جارٍ استرجاع أرشيف التقارير..." />;
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            أرشيف التقارير السابقة - {isSuperAdmin ? 'قسمي تقنية المعلومات والتسويق' : (unit?.name || 'الجهة')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin
              ? 'متابعة سجل التقارير اليومية لقسم تقنية المعلومات وقسم التسويق والإعلام'
              : 'استعراض ومتابعة سجل التقارير اليومية التي تم إعدادها'}
          </p>
        </div>

        <Link to="/reports/new">
          <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
            إنشاء تقرير جديد
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:min-w-[200px]">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="بحث بالتاريخ (YYYY-MM-DD) أو القسم أو النموذج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glrs-input search-input text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isSuperAdmin && (
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="glrs-select text-xs py-2 w-full sm:w-auto font-bold text-purple-900 bg-purple-50/50"
            >
              <option value="all">كافة تقارير القسمين</option>
              <option value={IT_UNIT_ID}>تقارير تقنية المعلومات</option>
              <option value={MKT_UNIT_ID}>تقارير التسويق والإعلام</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glrs-select text-xs py-2 w-full sm:w-auto"
          >
            <option value="all">جميع الحالات</option>
            <option value="submitted">مرفوع (قيد المراجعة)</option>
            <option value="closed">معتمد ومغلق</option>
            <option value="returned">معاد للتعديل</option>
            <option value="draft">مسودة</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">تاريخ التقرير</th>
              <th className="p-3.5">النموذج</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5">وقت الرفع</th>
              <th className="p-3.5">آخر تحديث</th>
              <th className="p-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  لا توجد تقارير مطابقة.
                </td>
              </tr>
            ) : (
              filteredReports.map((rep) => {
                const canEdit = rep.status === 'draft' || rep.status === 'returned';

                return (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>{formatArabicDate(rep.report_date)}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-700">
                      <span className="font-bold text-slate-900 block">{rep.reporting_unit?.name || 'الجهة'}</span>
                      <span className="text-[11px] text-slate-500">{rep.template?.name || 'النموذج العام'}</span>
                    </td>

                    <td className="p-3.5">
                      <ReportBadge status={rep.status} />
                    </td>

                    <td className="p-3.5 text-slate-500">
                      {rep.submitted_at ? formatArabicDateTime(rep.submitted_at) : 'مسودة لم ترفع'}
                    </td>

                    <td className="p-3.5 text-slate-400">
                      {formatArabicDateTime(rep.updated_at || rep.created_at)}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/reports/${rep.id}`}>
                          <Button variant="secondary" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                            عرض
                          </Button>
                        </Link>

                        {canEdit && (
                          <Link to={`/reports/${rep.id}/edit`}>
                            <Button variant="primary" size="sm" icon={<FileEdit className="w-3.5 h-3.5" />}>
                              تعديل
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredReports.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            لا توجد تقارير مطابقة
          </div>
        ) : (
          filteredReports.map((rep) => {
            const canEdit = rep.status === 'draft' || rep.status === 'returned';

            return (
              <div key={rep.id} className="glrs-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      تقرير يوم: {formatArabicDate(rep.report_date)}
                    </h4>
                    <span className="text-xs text-slate-500">{rep.template?.name}</span>
                  </div>
                  <ReportBadge status={rep.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>{rep.submitted_at ? formatArabicDateTime(rep.submitted_at) : 'مسودة'}</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link to={`/reports/${rep.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full" icon={<Eye className="w-3.5 h-3.5" />}>
                      عرض
                    </Button>
                  </Link>

                  {canEdit && (
                    <Link to={`/reports/${rep.id}/edit`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full" icon={<FileEdit className="w-3.5 h-3.5" />}>
                        تعديل
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
