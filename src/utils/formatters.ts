// Formatting utilities for Hospital Reports Management System

export const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export const truncateText = (text: string, maxLength: number = 80): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const isImageFile = (fileName?: string, fileType?: string | null, filePath?: string): boolean => {
  if (fileType && fileType.toLowerCase().startsWith('image/')) return true;
  if (filePath && (filePath.startsWith('data:image/') || filePath.startsWith('blob:image/'))) return true;
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '');
};
