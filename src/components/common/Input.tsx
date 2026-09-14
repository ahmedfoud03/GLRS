import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredIndicator?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  requiredIndicator,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full text-right">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 flex items-center gap-1">
          {label}
          {requiredIndicator && <span className="text-rose-600 font-bold">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`glrs-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredIndicator?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  requiredIndicator,
  className = '',
  rows = 4,
  id,
  ...props
}) => {
  const inputId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full text-right">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 flex items-center gap-1">
          {label}
          {requiredIndicator && <span className="text-rose-600 font-bold">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`glrs-textarea ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-500">{helperText}</span>}
    </div>
  );
};
