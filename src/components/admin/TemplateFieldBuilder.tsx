import React, { useState } from 'react';
import { ReportField, FieldType } from '../../types';
import { FIELD_TYPES } from '../../lib/constants';
import { Button } from '../common/Button';
import { Input, TextArea } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Layers, 
  HelpCircle,
  GripVertical
} from 'lucide-react';

interface TemplateFieldBuilderProps {
  templateId: string;
  fields: ReportField[];
  onSaveField: (field: Partial<ReportField>) => Promise<void>;
  onDeleteField: (fieldId: string) => Promise<void>;
  onReorderFields: (reordered: ReportField[]) => Promise<void>;
}

export const TemplateFieldBuilder: React.FC<TemplateFieldBuilderProps> = ({
  templateId,
  fields,
  onSaveField,
  onDeleteField,
  onReorderFields
}) => {
  const [editingField, setEditingField] = useState<Partial<ReportField> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);
  const [optionsText, setOptionsText] = useState('');
  const [loading, setLoading] = useState(false);

  const openNewFieldModal = () => {
    setEditingField({
      template_id: templateId,
      field_name: `field_${Date.now()}`,
      field_label: '',
      field_type: 'textarea',
      placeholder: '',
      required: false,
      sort_order: fields.length + 1,
      options: []
    });
    setOptionsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (field: ReportField) => {
    setEditingField(field);
    setOptionsText(Array.isArray(field.options) ? field.options.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !editingField.field_label?.trim()) return;

    try {
      setLoading(true);
      const parsedOptions =
        editingField.field_type === 'select' || editingField.field_type === 'multiselect'
          ? optionsText
              .split('\n')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

      await onSaveField({
        ...editingField,
        field_label: editingField.field_label.trim(),
        options: parsedOptions
      });
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    const reordered = newFields.map((f, i) => ({ ...f, sort_order: i + 1 }));
    await onReorderFields(reordered);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFieldId) return;
    try {
      setLoading(true);
      await onDeleteField(deletingFieldId);
      setDeletingFieldId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-right">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          حقول النموذج ومحتوياته ({fields.length} حقل)
        </h3>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={openNewFieldModal}
          icon={<Plus className="w-4 h-4" />}
        >
          إضافة حقل جديد
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-sm text-slate-500">لا توجد حقول مضافة لهذا القالب حتى الآن.</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openNewFieldModal}
            className="mt-3"
            icon={<Plus className="w-4 h-4" />}
          >
            إضافة أول حقل
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((field, idx) => {
            const typeInfo = FIELD_TYPES[field.field_type] || { label: field.field_type };

            return (
              <div
                key={field.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === fields.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="min-w-0 text-right">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {field.field_label}
                      </h4>
                      {field.required && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                          إلزامي *
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>النوع: {typeInfo.label}</span>
                      {field.placeholder && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="truncate max-w-[200px]">({field.placeholder})</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(field)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="تعديل الحقل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingFieldId(field.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="حذف الحقل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Field Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField?.id ? 'تعديل بيانات الحقل' : 'إضافة حقل جديد للنموذج'}
        maxWidth="md"
      >
        {editingField && (
          <form onSubmit={handleModalSubmit} className="flex flex-col gap-4 text-right">
            <Input
              label="عنوان / تسمية الحقل"
              placeholder="مثال: الأعمال والمهام المنجزة خلال اليوم"
              value={editingField.field_label || ''}
              onChange={(e) => setEditingField({ ...editingField, field_label: e.target.value })}
              requiredIndicator
              disabled={loading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 w-full text-right">
                <label className="text-sm font-semibold text-slate-700">نوع الإدخال</label>
                <select
                  className="glrs-select"
                  value={editingField.field_type || 'textarea'}
                  onChange={(e) =>
                    setEditingField({ ...editingField, field_type: e.target.value as FieldType })
                  }
                  disabled={loading}
                >
                  {Object.entries(FIELD_TYPES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="نص تلميحي (Placeholder)"
                placeholder="مثال: أدخل التفاصيل هنا..."
                value={editingField.placeholder || ''}
                onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                disabled={loading}
              />
            </div>

            {(editingField.field_type === 'select' || editingField.field_type === 'multiselect') && (
              <TextArea
                label="خيارات القائمة (اكتب كل خيار في سطر منفصل)"
                placeholder="الخيار الأول&#10;الخيار الثاني&#10;الخيار الثالث"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                rows={4}
                requiredIndicator
                disabled={loading}
              />
            )}

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="field-required-chk"
                checked={Boolean(editingField.required)}
                onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
                disabled={loading}
              />
              <label htmlFor="field-required-chk" className="text-xs font-bold text-slate-700 cursor-pointer">
                حقل إلزامي (لا يمكن رفع التقرير بدون تعبئته)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={loading}>
                إلغاء
              </Button>
              <Button type="submit" variant="primary" loading={loading}>
                حفظ الحقل
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Field Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deletingFieldId)}
        onClose={() => setDeletingFieldId(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الحقل"
        message="هل أنت متأكد من حذف هذا الحقل من القالب؟ سيتم إزالته من استمارة التقارير الجديدة."
        confirmText="نعم، احذف الحقل"
        cancelText="إلغاء"
        variant="danger"
        loading={loading}
      />
    </div>
  );
};
