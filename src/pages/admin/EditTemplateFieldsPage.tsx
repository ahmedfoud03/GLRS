import React, { useState, useEffect } from 'react';
import { templateService } from '../../services/templateService';
import { ReportTemplate, ReportField } from '../../types';
import { TemplateFieldBuilder } from '../../components/admin/TemplateFieldBuilder';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';
import { ArrowRight, Sliders, AlertCircle } from 'lucide-react';
import { Link } from '../../components/common/Link';

export const EditTemplateFieldsPage: React.FC<{ templateId: string }> = ({ templateId }) => {
  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const t = await templateService.getTemplateById(templateId);
      setTemplate(t);
    } catch (err: any) {
      toastError(err.message || 'فشل تحميل بيانات القالب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const handleSaveField = async (fieldData: Partial<ReportField>) => {
    try {
      await templateService.saveField(fieldData);
      success('تم حفظ الحقل بنجاح');
      await loadTemplate();
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ الحقل');
      throw err;
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      await templateService.deleteField(fieldId);
      success('تم حذف الحقل من القالب');
      await loadTemplate();
    } catch (err: any) {
      toastError(err.message || 'فشل حذف الحقل');
      throw err;
    }
  };

  const handleReorderFields = async (reordered: ReportField[]) => {
    try {
      // Save all updated sort orders
      for (const f of reordered) {
        await templateService.saveField(f);
      }
      setTemplate((prev) => (prev ? { ...prev, fields: reordered } : null));
      success('تم تحديث ترتيب الحقول');
    } catch (err: any) {
      toastError(err.message || 'فشل تحديث ترتيب الحقول');
    }
  };

  if (loading) {
    return <Spinner size="lg" text="جارٍ تحميل حقول النموذج..." />;
  }

  if (!template) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">القالب غير موجود</h3>
          <p className="text-xs text-slate-500 mb-6">
            تعذر العثور على القالب المطلوب.
          </p>
          <Link to="/admin/templates">
            <Button variant="secondary" size="sm">
              العودة لقائمة القوالب
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-right max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald-600" />
            تخصيص حقول النموذج: {template.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إضافة، تعديل، وترتيب الحقول الديناميكية التي تظهر لمعد التقرير
          </p>
        </div>

        <Link to="/admin/templates">
          <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
            رجوع لقائمة القوالب
          </Button>
        </Link>
      </div>

      {/* Field Builder */}
      <TemplateFieldBuilder
        templateId={template.id}
        fields={template.fields || []}
        onSaveField={handleSaveField}
        onDeleteField={handleDeleteField}
        onReorderFields={handleReorderFields}
      />
    </div>
  );
};
