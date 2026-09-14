import React from 'react';
import { ReportField } from '../../types';
import { Input, TextArea } from '../common/Input';

interface DynamicFieldRendererProps {
  field: ReportField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false
}) => {
  const options: string[] = Array.isArray(field.options) ? field.options : [];

  switch (field.field_type) {
    case 'textarea':
      return (
        <TextArea
          label={field.field_label}
          placeholder={field.placeholder || undefined}
          requiredIndicator={field.required}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          disabled={disabled}
          rows={4}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          label={field.field_label}
          placeholder={field.placeholder || undefined}
          requiredIndicator={field.required}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          error={error}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          label={field.field_label}
          requiredIndicator={field.required}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          disabled={disabled}
        />
      );

    case 'time':
      return (
        <Input
          type="time"
          label={field.field_label}
          requiredIndicator={field.required}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          disabled={disabled}
        />
      );

    case 'select':
      return (
        <div className="flex flex-col gap-1.5 w-full text-right">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
            {field.field_label}
            {field.required && <span className="text-rose-600 font-bold">*</span>}
          </label>
          <select
            className={`glrs-select ${error ? 'error' : ''}`}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">-- {field.placeholder || 'اختر من القائمة'} --</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
        </div>
      );

    case 'multiselect': {
      const selectedVals: string[] = Array.isArray(value) ? value : [];
      const handleToggle = (opt: string) => {
        if (disabled) return;
        if (selectedVals.includes(opt)) {
          onChange(selectedVals.filter((v) => v !== opt));
        } else {
          onChange([...selectedVals, opt]);
        }
      };

      return (
        <div className="flex flex-col gap-2 w-full text-right">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
            {field.field_label}
            {field.required && <span className="text-rose-600 font-bold">*</span>}
          </label>
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            {options.map((opt, idx) => {
              const isSelected = selectedVals.includes(opt);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggle(opt)}
                  disabled={disabled}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
          {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
        </div>
      );
    }

    case 'checkbox':
      return (
        <div className="flex items-center gap-3 py-2 text-right">
          <input
            type="checkbox"
            id={`chk-${field.id}`}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor={`chk-${field.id}`} className="text-sm font-semibold text-slate-700 cursor-pointer">
            {field.field_label}
            {field.required && <span className="text-rose-600 font-bold mr-1">*</span>}
          </label>
          {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
        </div>
      );

    case 'text':
    default:
      return (
        <Input
          type="text"
          label={field.field_label}
          placeholder={field.placeholder || undefined}
          requiredIndicator={field.required}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          disabled={disabled}
        />
      );
  }
};
