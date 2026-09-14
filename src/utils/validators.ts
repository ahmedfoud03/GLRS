import { ReportField } from '../types';

export interface ValidationError {
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  message: string;
}

export const validateReportAnswers = (
  fields: ReportField[],
  answers: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    if (field.required) {
      const value = answers[field.id];
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors[field.id] = `حقل "${field.field_label}" إلزامي ولا يمكن تركه فارغاً.`;
      }
    }

    // Number validation
    if (field.field_type === 'number' && answers[field.id] !== undefined && answers[field.id] !== '') {
      const num = Number(answers[field.id]);
      if (isNaN(num)) {
        errors[field.id] = `يجب إدخال قيمة رقمية صحيحة في "${field.field_label}".`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' };
  }
  return { isValid: true };
};
