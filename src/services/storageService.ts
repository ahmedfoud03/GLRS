import { supabase, isSupabaseConfigured, mockStore } from '../lib/supabase';
import { Attachment } from '../types';
import { sanitizeFileName } from '../utils/formatters';

const BUCKET_NAME = 'report_attachments';

// Helper to compress / convert files to persistent Data URL for mock storage
const readFileAsDataUrl = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            resolve(canvas.toDataURL(outputType, 0.85));
            return;
          }
          resolve(e.target?.result as string);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    }
  });
};

export const storageService = {
  /**
   * Upload attachment file
   */
  async uploadFile(reportId: string, file: File, userId: string): Promise<Attachment> {
    const timestamp = Date.now();
    const cleanName = sanitizeFileName(file.name);
    const filePath = `${reportId}/${timestamp}_${cleanName}`;

    if (isSupabaseConfigured()) {
      // 1. Upload to Storage
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadErr) {
        throw new Error('فشل رفع الملف إلى التخزين السحابي: ' + uploadErr.message);
      }

      // 2. Insert record in attachments table
      const { data, error: dbErr } = await supabase
        .from('attachments')
        .insert({
          report_id: reportId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: userId
        })
        .select('*, uploader:profiles(*)')
        .single();

      if (dbErr) {
        throw new Error('فشل حفظ بيانات المرفق: ' + dbErr.message);
      }

      return data;
    } else {
      // Mock upload with persistent Data URL
      const persistentPath = await readFileAsDataUrl(file);

      const newAttachment: Attachment = {
        id: 'att-' + timestamp,
        report_id: reportId,
        file_name: file.name,
        file_path: persistentPath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: userId,
        created_at: new Date().toISOString()
      };

      const attachments = mockStore.getAttachments();
      attachments.push(newAttachment);
      mockStore.saveAttachments(attachments);
      return newAttachment;
    }
  },

  /**
   * Get Download / View URL for an attachment
   */
  async getFileUrl(filePath: string): Promise<string> {
    if (!filePath) return '';

    // If it's already a full URL, Data URL, or blob
    if (filePath.startsWith('http') || filePath.startsWith('data:') || filePath.startsWith('blob:')) {
      return filePath;
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1 hour signed URL

      if (error || !data?.signedUrl) {
        // Fallback to public URL if public bucket
        const { data: pubData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return pubData.publicUrl;
      }
      return data.signedUrl;
    } else {
      return filePath;
    }
  },

  /**
   * Safely triggers download on mobile and desktop without popup blocker issues
   */
  downloadFile(url: string, fileName: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 150);
  },

  /**
   * Delete an attachment
   */
  async deleteAttachment(attachmentId: string, filePath: string): Promise<void> {
    if (isSupabaseConfigured()) {
      if (filePath && !filePath.startsWith('blob:')) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
      const { error } = await supabase.from('attachments').delete().eq('id', attachmentId);
      if (error) throw new Error(error.message);
    } else {
      const attachments = mockStore.getAttachments();
      const filtered = attachments.filter(a => a.id !== attachmentId);
      mockStore.saveAttachments(filtered);
    }
  }
};
