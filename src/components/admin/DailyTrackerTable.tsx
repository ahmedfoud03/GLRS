import React, { useState, useMemo } from 'react';
import { UnsubmittedUnitInfo } from '../../types';
import { ReportBadge, UnitTypeBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Link } from '../common/Link';
import { formatArabicDateTime } from '../../utils/dateUtils';
import { 
  Search, 
  Filter, 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  ExternalLink, 
  User, 
  Clock, 
  Building2,
  AlertCircle
} from 'lucide-react';

interface DailyTrackerTableProps {
  trackerData: UnsubmittedUnitInfo[];
  onQuickReturn?: (reportId: string) => void;
  onQuickClose?: (reportId: string) => void;
  loading?: boolean;
}

export const DailyTrackerTable: React.FC<DailyTrackerTableProps> = ({
  trackerData,
  onQuickReturn,
  onQuickClose,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return trackerData.filter((item) => {
      const matchSearch =
        item.unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.unit.code && item.unit.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.assignedUsers.some((u) => u.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'unsubmitted' && item.status === 'unsubmitted') ||
        (statusFilter === 'submitted' && item.status === 'submitted') ||
        (statusFilter === 'returned' && item.status === 'returned') ||
        (statusFilter === 'closed' && item.status === 'closed') ||
        (statusFilter === 'draft' && item.status === 'draft');

      const matchType = typeFilter === 'all' || item.unit.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [trackerData, searchTerm, statusFilter, typeFilter]);

  return (
    <div className="flex flex-col gap-4 text-right">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:min-w-[220px]">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3" aria-hidden="true">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="بحث باسم الجهة أو الموظف المسؤول..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glrs-input search-input text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glrs-select text-xs py-2 w-full sm:w-auto"
          >
            <option value="all">جميع الحالات</option>
            <option value="submitted">مرفوع (قيد المراجعة)</option>
            <option value="closed">معتمد ومغلق</option>
            <option value="returned">معاد للتعديل</option>
            <option value="unsubmitted">لم يرفع بعد</option>
            <option value="draft">مسودة</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="glrs-select text-xs py-2 w-full sm:w-auto"
          >
            <option value="all">جميع أنواع الجهات</option>
            <option value="department">أقسام طبية</option>
            <option value="service">خدمات مساندة</option>
            <option value="administration">إدارات</option>
            <option value="shift">مناوبات ليلية</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">الجهة / القسم</th>
              <th className="p-3.5">النوع</th>
              <th className="p-3.5">المسؤول عن التقرير</th>
              <th className="p-3.5">حالة تقرير اليوم</th>
              <th className="p-3.5">وقت الرفع</th>
              <th className="p-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  لا توجد جهات مطابقة لشروط البحث والفلترة.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const hasReport = Boolean(item.report);
                const reporterName = item.report?.user?.full_name || item.assignedUsers[0]?.full_name || 'غير محدد';

                return (
                  <tr key={item.unit.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <span>{item.unit.name}</span>
                          {item.unit.code && (
                            <span className="text-[10px] text-slate-400 block font-normal">
                              كود: {item.unit.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <UnitTypeBadge type={item.unit.type} />
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{reporterName}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <ReportBadge status={item.status} />
                    </td>

                    <td className="p-3.5 text-slate-500">
                      {item.report?.submitted_at ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatArabicDateTime(item.report.submitted_at)}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {hasReport ? (
                          <Link to={`/admin/reports/${item.report!.id}`}>
                            <Button variant="secondary" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                              عرض
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">بانتظار الرفع</span>
                        )}

                        {hasReport && item.report?.status === 'submitted' && (
                          <>
                            {onQuickReturn && (
                              <button
                                onClick={() => onQuickReturn(item.report!.id)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                                title="إعادة للتعديل"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onQuickClose && (
                              <button
                                onClick={() => onQuickClose(item.report!.id)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                                title="اعتماد وإغلاق"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
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
        {filteredData.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            لا توجد بيانات مطابقة
          </div>
        ) : (
          filteredData.map((item) => {
            const hasReport = Boolean(item.report);
            const reporterName = item.report?.user?.full_name || item.assignedUsers[0]?.full_name || 'غير محدد';

            return (
              <div key={item.unit.id} className="glrs-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.unit.name}</h4>
                    <span className="text-[11px] text-slate-500">مسؤول: {reporterName}</span>
                  </div>
                  <ReportBadge status={item.status} />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <UnitTypeBadge type={item.unit.type} />
                  <span>
                    {item.report?.submitted_at ? formatArabicDateTime(item.report.submitted_at) : 'لم يرفع'}
                  </span>
                </div>

                {hasReport && (
                  <div className="pt-2">
                    <Link to={`/admin/reports/${item.report!.id}`} className="w-full">
                      <Button variant="secondary" size="sm" className="w-full" icon={<Eye className="w-3.5 h-3.5" />}>
                        عرض التقرير والمراجعة
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
