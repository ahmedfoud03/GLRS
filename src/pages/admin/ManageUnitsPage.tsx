import React, { useState, useEffect } from 'react';
import { unitService } from '../../services/unitService';
import { templateService } from '../../services/templateService';
import { ReportingUnit, ReportTemplate } from '../../types';
import { UnitTypeBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { UnitFormModal } from '../../components/admin/UnitFormModal';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../contexts/ToastContext';
import { 
  Building2, 
  Plus, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  FileText,
  Layers
} from 'lucide-react';

export const ManageUnitsPage: React.FC = () => {
  const [units, setUnits] = useState<ReportingUnit[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ReportingUnit | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [uList, tplList] = await Promise.all([
        unitService.getUnits(true), // include inactive
        templateService.getTemplates()
      ]);
      setUnits(uList);
      setTemplates(tplList);
    } catch (err: any) {
      toastError(err.message || 'فشل تحميل الجهات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: ReportingUnit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleSaveUnit = async (formData: any) => {
    try {
      setActionLoading(true);
      await unitService.saveUnit(formData);
      success(editingUnit ? 'تم تحديث بيانات الجهة بنجاح' : 'تمت إضافة الجهة الجديدة بنجاح');
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ بيانات الجهة');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (unit: ReportingUnit) => {
    try {
      const newState = !unit.active;
      await unitService.toggleUnitActive(unit.id, newState);
      success(`تم ${newState ? 'تفعيل' : 'تعطيل'} جهة ${unit.name}`);
      await loadData();
    } catch (err: any) {
      toastError(err.message || 'فشل تغيير حالة الجهة');
    }
  };

  if (loading) {
    return <Spinner size="lg" text="جارٍ استرجاع قائمة الجهات والأقسام..." />;
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            إدارة جهات وأقسام إعداد التقارير
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إضافة وتعديل الأقسام الطبية، الخدمات المساندة، والمناوبات، وتحديد قوالب التقارير المعتمدة لكل منها
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          إضافة جهة / قسم جديد
        </Button>
      </div>

      {/* Units Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">الجهة / القسم</th>
              <th className="p-3.5">الرمز (Code)</th>
              <th className="p-3.5">التصنيف</th>
              <th className="p-3.5">قالب التقرير المعتمد</th>
              <th className="p-3.5">الحالة</th>
              <th className="p-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {units.map((unit) => (
              <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3.5 font-bold text-slate-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 font-black flex items-center justify-center text-xs shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span>{unit.name}</span>
                      {unit.description && (
                        <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                          {unit.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="p-3.5 font-mono text-slate-600">
                  {unit.code ? <span className="bg-slate-100 px-2 py-0.5 rounded">{unit.code}</span> : '—'}
                </td>

                <td className="p-3.5">
                  <UnitTypeBadge type={unit.type} />
                </td>

                <td className="p-3.5 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{unit.report_template?.name || 'النموذج العام الافتراضي'}</span>
                  </div>
                </td>

                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      unit.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {unit.active ? 'نشطة (مطلوبة)' : 'معطلة'}
                  </span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(unit)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="تعديل الجهة"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(unit)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        unit.active
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={unit.active ? 'تعطيل الجهة' : 'تفعيل الجهة'}
                    >
                      {unit.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unit Modal */}
      <UnitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveUnit}
        unit={editingUnit}
        templates={templates}
        loading={actionLoading}
      />
    </div>
  );
};
