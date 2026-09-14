import React, { useState, useEffect } from 'react';
import { templateService } from '../../services/templateService';
import { ReportTemplate } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, TextArea } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../contexts/ToastContext';
import { 
  Sliders, 
  Plus, 
  Edit3, 
  Layers, 
  CheckCircle2, 
  ArrowLeft,
  FileText
} from 'lucide-react';
import { Link } from '../../components/common/Link';

export const ManageTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [active, setActive] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const list = await templateService.getTemplates(true);
      setTemplates(list);
    } catch (err: any) {
      toastError(err.message || 'فشل تحميل القوالب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setName('');
    setDescription('');
    setIsDefault(false);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: ReportTemplate) => {
    setEditingTemplate(t);
    setName(t.name);
    setDescription(t.description || '');
    setIsDefault(t.is_default);
    setActive(t.active);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setActionLoading(true);
      await templateService.saveTemplate({
        id: editingTemplate?.id,
        name: name.trim(),
        description: description.trim(),
        is_default: isDefault,
        active
      });
      success(editingTemplate ? 'تم تحديث بيانات القالب بنجاح' : 'تم إنشاء القالب الجديد بنجاح');
      setIsModalOpen(false);
      await loadTemplates();
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ القالب');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" text="جارٍ استرجاع قوالب التقارير..." />;
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald-600" />
            إدارة قوالب واستمارات التقارير اليومية
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إنشاء وتخصيص نماذج التقارير الديناميكية وتحديد الحقول المناسبة لكل جهة
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
        >
          إنشاء قالب جديد
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="glrs-card p-5 border-slate-200 flex flex-col justify-between gap-4 hover:border-emerald-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                {tpl.is_default && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    القالب الافتراضي للمستشفى
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{tpl.name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {tpl.description || 'لا يوجد وصف مضاف لهذا القالب.'}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {tpl.fields?.length || 0} حقل استمارة
                </span>
                <span className={tpl.active ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                  {tpl.active ? 'مفعّل' : 'معطل'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(tpl)}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                تعديل القالب
              </button>

              <Link to={`/admin/templates/${tpl.id}/fields`}>
                <Button variant="secondary" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
                  إدارة حقول النموذج ←
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'تعديل بيانات القالب' : 'إنشاء قالب تقرير جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveTemplate} className="flex flex-col gap-4 text-right">
          <Input
            label="اسم القالب"
            placeholder="مثال: نموذج تقرير قسم الأشعة والتصوير الطبي"
            value={name}
            onChange={(e) => setName(e.target.value)}
            requiredIndicator
            disabled={actionLoading}
          />

          <TextArea
            label="وصف القالب والغرض منه"
            placeholder="شرح موجز عن الأقسام التي ينطبق عليها هذا النموذج..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={actionLoading}
          />

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tpl-default-chk"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
                disabled={actionLoading}
              />
              <label htmlFor="tpl-default-chk" className="text-xs font-bold text-slate-700 cursor-pointer">
                تعيين كقالب افتراضي عام للأقسام التي ليس لها قالب خاص
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tpl-active-chk"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
                disabled={actionLoading}
              />
              <label htmlFor="tpl-active-chk" className="text-xs font-bold text-slate-700 cursor-pointer">
                القالب مفعّل ومتاح للاستخدام
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              {editingTemplate ? 'حفظ التعديلات' : 'إنشاء القالب'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
