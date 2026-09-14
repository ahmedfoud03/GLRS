import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { UnsubmittedUnitInfo } from '../../types';
import { ReportBadge, UnitTypeBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatArabicDate, getTodayDateString } from '../../utils/dateUtils';
import { 
  AlertTriangle, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  RefreshCw, 
  ArrowRight,
  User
} from 'lucide-react';
import { Link } from '../../components/common/Link';

export const UnsubmittedUnitsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [unsubmittedUnits, setUnsubmittedUnits] = useState<UnsubmittedUnitInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUnsubmitted = async () => {
    try {
      setLoading(true);
      const tracker = await reportService.getUnsubmittedTracker(selectedDate);
      const missing = tracker.filter(
        (t) => t.status === 'unsubmitted' || t.status === 'draft'
      );
      setUnsubmittedUnits(missing);
    } catch (err) {
      console.error('Failed to load unsubmitted units:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnsubmitted();
  }, [selectedDate]);

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            كشف الجهات والأقسام التي لم ترفع التقرير اليومي
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            حصر دقيق للأقسام والخدمات المتأخرة عن رفع تقرير يوم {formatArabicDate(selectedDate)} مع بيانات التواصل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
            <Calendar className="w-4 h-4 text-emerald-600 mr-1" />
            <span className="text-slate-500 font-bold">التاريخ:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            />
          </div>

          <Link to="/admin">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              رجوع للمتابعة العامة
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner size="lg" text="جارٍ حصر الأقسام المتأخرة..." />
      ) : unsubmittedUnits.length === 0 ? (
        <div className="p-12 text-center bg-emerald-50/70 border border-emerald-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            ✓
          </div>
          <h3 className="text-base font-bold text-emerald-900 mb-1">
            ممتاز! كافة الجهات قامت برفع التقرير اليومي بنجاح
          </h3>
          <p className="text-xs text-emerald-700">
            لا توجد أي جهة متأخرة عن تسليم تقرير يوم {formatArabicDate(selectedDate)}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <span className="font-bold">
              إجمالي الجهات المتأخرة: {unsubmittedUnits.length} جهة
            </span>
            <span>يرجى التواصل مع مسؤولي الأقسام لسرعة رفع التقرير.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unsubmittedUnits.map((item) => (
              <div
                key={item.unit.id}
                className="glrs-card p-5 border-slate-200 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.unit.name}</h4>
                        {item.unit.code && (
                          <span className="text-[10px] text-slate-400">كود: {item.unit.code}</span>
                        )}
                      </div>
                    </div>
                    <UnitTypeBadge type={item.unit.type} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      المسؤولون المسجلون عن التقرير:
                    </span>
                    {item.assignedUsers.length === 0 ? (
                      <span className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                        ⚠ لم يتم تعيين موظف مسؤول عن هذه الجهة بعد.
                      </span>
                    ) : (
                      item.assignedUsers.map((u) => (
                        <div key={u.id} className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700">
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {u.full_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            {u.phone && (
                              <a
                                href={`tel:${u.phone}`}
                                className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                              >
                                <Phone className="w-3 h-3" />
                                <span dir="ltr" className="phone-number">{u.phone}</span>
                              </a>
                            )}
                            <a
                              href={`mailto:${u.email}`}
                              className="flex items-center gap-1 text-sky-700 hover:underline"
                            >
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">الحالة الحالية:</span>
                  <ReportBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
