import React, { useState, useEffect } from 'react';
import { ReportingUnit, ReportTemplate, UnitType } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, TextArea } from '../common/Input';
import { useToast } from '../../contexts/ToastContext';
import { UNIT_TYPES } from '../../lib/constants';
import { Building2, Layers, FileText } from 'lucide-react';

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (unitData: any) => Promise<void>;
  unit?: ReportingUnit | null;
  templates: ReportTemplate[];
  loading?: boolean;
}

export const UnitFormModal: React.FC<UnitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  unit,
  templates,
  loading = false
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<UnitType>('department');
  const [description, setDescription] = useState('');
  const [reportTemplateId, setReportTemplateId] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { error: toastError } = useToast();

  useEffect(() => {
    if (unit) {
      setName(unit.name || '');
      setCode(unit.code || '');
      setType(unit.type || 'department');
      setDescription(unit.description || '');
      setReportTemplateId(unit.report_template_id || '');
      setActive(unit.active !== undefined ? unit.active : true);
    } else {
      setName('');
      setCode('');
      setType('department');
      setDescription('');
      setReportTemplateId(templates[0]?.id || '');
      setActive(true);
    }
    setErrors({});
  }, [unit, templates, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'يرجى إدخال اسم الجهة أو القسم.';
    if (!reportTemplateId) newErrors.template = 'يرجى تحديد قالب التقرير اليومي الخاص بهذه الجهة.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        id: unit?.id,
        name: name.trim(),
        code: code.trim() || undefined,
        type,
        description: description.trim(),
        report_template_id: reportTemplateId,
        active
      });
      onClose();
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ بيانات الجهة');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={unit ? 'تعديل بيانات الجهة' : 'إضافة جهة أو قسم جديد'}
      subtitle="إدارة أقسام وخدمات ومناوبات مستشفى اللواء الأخضر الدولي"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        <Input
          label="اسم الجهة / القسم / الخدمة"
          placeholder="مثال: قسم العناية المركزة (ICU) أو الصيدلية المركزية"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          requiredIndicator
          disabled={loading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="رمز الجهة (Code)"
            placeholder="مثال: ICU-01"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />

          <div className="flex flex-col gap-1.5 w-full text-right">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              تصنيف الجهة <span className="text-rose-600 font-bold">*</span>
            </label>
            <select
              className="glrs-select"
              value={type}
              onChange={(e) => setType(e.target.value as UnitType)}
              disabled={loading}
            >
              {Object.entries(UNIT_TYPES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full text-right">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            نموذج التقرير المعتمد للجهة <span className="text-rose-600 font-bold">*</span>
          </label>
          <select
            className={`glrs-select ${errors.template ? 'error' : ''}`}
            value={reportTemplateId}
            onChange={(e) => setReportTemplateId(e.target.value)}
            disabled={loading}
          >
            <option value="">-- اختر قالب التقرير --</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.is_default ? '(الافتراضي)' : ''}
              </option>
            ))}
          </select>
          {errors.template && <span className="text-xs text-rose-600 font-medium">{errors.template}</span>}
        </div>

        <TextArea
          label="الوصف والمهام الرئيسية"
          placeholder="نبذة موجزة عن اختصاصات هذا القسم أو الخدمة..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={loading}
        />

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="unit-active-chk"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded"
            disabled={loading}
          />
          <label htmlFor="unit-active-chk" className="text-xs font-bold text-slate-700 cursor-pointer">
            الجهة نشطة وتُلزم برفع التقرير اليومي
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {unit ? 'حفظ التعديلات' : 'إنشاء الجهة'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
