import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { formatArabicDateTime } from '../../utils/dateUtils';
import { Activity, Shield, RefreshCw, User, FileText, CheckCircle2 } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAuditLogs(60);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'SUBMIT_REPORT':
        return <span className="status-badge badge-submitted">رفع تقرير</span>;
      case 'RETURN_REPORT':
        return <span className="status-badge badge-returned">إعادة تقرير</span>;
      case 'CLOSE_REPORT':
        return <span className="status-badge badge-closed">اعتماد وإغلاق</span>;
      case 'SAVE_DRAFT_REPORT':
        return <span className="status-badge badge-draft">حفظ مسودة</span>;
      default:
        return <span className="status-badge badge-unsubmitted">{action}</span>;
    }
  };

  if (loading) {
    return <Spinner size="lg" text="جارٍ استرجاع سجل التدقيق والعمليات..." />;
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            سجل العمليات والتدقيق الأمني (Audit Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة دقيقة لكافة عمليات إنشاء، رفع، مراجعة، وإغلاق التقارير داخل النظام
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadLogs}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          تحديث السجل
        </Button>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">وقت وتاريخ العملية</th>
              <th className="p-3.5">المستخدم المسؤول</th>
              <th className="p-3.5">نوع الإجراء</th>
              <th className="p-3.5">الكيان المتأثر</th>
              <th className="p-3.5">تفاصيل وبيانات الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  لا توجد سجلات مسجلة حتى الآن.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono text-slate-600">
                    {formatArabicDateTime(log.created_at)}
                  </td>

                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.user?.full_name || 'النظام / غير محدد'}</span>
                    </div>
                  </td>

                  <td className="p-3.5">{getActionBadge(log.action)}</td>

                  <td className="p-3.5 text-slate-600 font-mono">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)})` : ''}
                    </span>
                  </td>

                  <td className="p-3.5 text-slate-700">
                    {log.metadata && Object.keys(log.metadata).length > 0 ? (
                      <span className="text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100 block truncate max-w-md">
                        {JSON.stringify(log.metadata)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
