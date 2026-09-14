import React from 'react';
import { AdminStatsSummary } from '../../types';
import { Card } from '../common/Card';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle, 
  FileEdit,
  TrendingUp
} from 'lucide-react';

interface StatsOverviewProps {
  stats: AdminStatsSummary;
  dateLabel?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, dateLabel }) => {
  return (
    <div className="flex flex-col gap-4 text-right">
      {/* Progress Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-l from-emerald-800 to-sky-900 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold">نسبة إنجاز تقارير اليوم بالمستشفى ({stats.submissionRate}%)</h4>
          </div>
          {dateLabel && <span className="text-xs text-slate-300 font-medium">{dateLabel}</span>}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, stats.submissionRate))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2">
          <span>تم الرفع والاعتماد: {stats.totalSubmittedToday} جهة</span>
          <span>المتبقي: {stats.totalUnsubmittedToday} جهة</span>
          <span>إجمالي الجهات: {stats.totalActiveUnits}</span>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500">إجمالي الجهات</span>
          </div>
          <p className="text-xl font-black text-slate-800">{stats.totalActiveUnits}</p>
        </Card>

        <Card className="p-3.5 border-sky-200 bg-sky-50/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-sky-700">مرفوع للمراجعة</span>
          </div>
          <p className="text-xl font-black text-sky-900">{stats.totalSubmittedToday}</p>
        </Card>

        <Card className="p-3.5 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-emerald-700">معتمد ومغلق</span>
          </div>
          <p className="text-xl font-black text-emerald-900">{stats.totalClosedToday}</p>
        </Card>

        <Card className="p-3.5 border-rose-200 bg-rose-50/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-rose-700">معاد للتعديل</span>
          </div>
          <p className="text-xl font-black text-rose-900">{stats.totalReturnedToday}</p>
        </Card>

        <Card className="p-3.5 border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-slate-200 text-slate-600">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-600">لم يرفع بعد</span>
          </div>
          <p className="text-xl font-black text-slate-700">{stats.totalUnsubmittedToday}</p>
        </Card>

        <Card className="p-3.5 border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <FileEdit className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-amber-700">مسودات حالية</span>
          </div>
          <p className="text-xl font-black text-amber-900">{stats.totalDraftsToday}</p>
        </Card>
      </div>
    </div>
  );
};
