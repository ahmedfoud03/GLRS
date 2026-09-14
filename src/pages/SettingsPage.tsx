import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { RoleBadge } from '../components/common/Badge';
import { HOSPITAL_INFO } from '../lib/constants';
import { isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../contexts/ToastContext';
import { 
  Settings, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isLive = isSupabaseConfigured();
  const { success, error } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError('');
      await authService.updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      success('تم تغيير كلمة المرور بنجاح.');
    } catch (err: any) {
      const message = err.message || 'تعذر تغيير كلمة المرور.';
      setPasswordError(message);
      error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            إعدادات الملف التعريفي والنظام
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            معلومات الحساب، بيانات المستشفى، وتكوينات الاتصال بقاعدة البيانات
          </p>
        </div>
      </div>

      {/* User Info Card */}
      {user && (
        <Card className="p-6 border-slate-200">
          <h3 className="text-base font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            بيانات الحساب الشخصي
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">الاسم الكامل:</span>
              <p className="text-sm font-bold text-slate-900">{user.profile.full_name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">البريد الإلكتروني:</span>
              <p className="text-sm font-bold text-slate-900">{user.email}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">الدور والصلاحية:</span>
              <RoleBadge role={user.profile.role} />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">الجهة التابع لها:</span>
              <p className="text-sm font-bold text-slate-900">
                {user.profile.reporting_unit?.name || 'إدارة المستشفى (شامل)'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {user && (
        <Card className="p-6 border-slate-200">
          <h3 className="text-base font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            تغيير كلمة المرور
          </h3>
          <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="password"
              label="كلمة المرور الجديدة"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={6}
              required
              disabled={savingPassword}
            />
            <Input
              type="password"
              label="تأكيد كلمة المرور الجديدة"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              required
              disabled={savingPassword}
              error={passwordError}
            />
            <div className="sm:col-span-2 flex justify-start">
              <Button type="submit" variant="primary" loading={savingPassword}>
                حفظ كلمة المرور
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Hospital Identity Card */}
      <Card className="p-6 border-slate-200">
        <h3 className="text-base font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sky-600" />
          بيانات منشأة المستشفى الرسمية
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <img
            src={HOSPITAL_INFO.logoUrl}
            alt="Logo"
            className="w-16 h-16 object-contain p-1 rounded-xl bg-white border border-slate-200 shadow-sm"
          />
          <div>
            <h4 className="text-base font-black text-slate-900">{HOSPITAL_INFO.nameAr}</h4>
            <p className="text-xs text-emerald-800 font-bold">{HOSPITAL_INFO.nameEn}</p>
            <p className="text-xs text-slate-500 mt-1">{HOSPITAL_INFO.city}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <span className="text-slate-500">البريد المعتمد للتقارير:</span>
            <span className="font-bold text-slate-800">{HOSPITAL_INFO.contactEmail}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
            <span className="text-slate-500">هاتف الاستعلامات:</span>
            <span className="font-bold text-slate-800" dir="ltr">{HOSPITAL_INFO.contactPhone}</span>
          </div>
        </div>
      </Card>

      {/* System & Supabase Connectivity Status */}
      <Card className="p-6 border-slate-200">
        <h3 className="text-base font-bold text-slate-800 pb-3 mb-4 border-b border-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          حالة الاتصال والبيئة السحابية
        </h3>

        <div className="flex items-center justify-between p-4 rounded-xl border mb-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isLive ? 'متصل بقاعدة بيانات Supabase الحية' : 'وضع المعاينة الفورية والتجريب (Demo Store)'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLive
                  ? 'تم تحميل مفاتيح VITE_SUPABASE_URL وتأمين RLS والتخزين السحابي.'
                  : 'النظام يعمل حالياً بمحرك بيانات محلي تفاعلي وسينتقل تلقائياً إلى Supabase فور إدخال المفاتيح في ملف .env.'}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isLive ? 'Supabase Live' : 'Demo Active'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono text-left" dir="ltr">
          <p className="text-slate-400 mb-1"># Environment Setup (.env):</p>
          <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
          <p>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
        </div>
      </Card>
    </div>
  );
};
