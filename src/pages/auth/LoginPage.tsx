import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { HOSPITAL_INFO } from '../../lib/constants';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { 
  LogIn, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Phone, 
  Building2, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const { navigate } = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف وكلمة المرور.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await login(phone.trim(), password.trim());
      toastSuccess(`مرحباً بك، ${loggedUser.profile.full_name}`);
      if (loggedUser.profile.role === 'admin' || loggedUser.profile.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تسجيل الدخول، يرجى التأكد من البيانات.');
      toastError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'super_admin' | 'admin' | 'reporter', unitId?: string) => {
    try {
      setLoading(true);
      setErrorMsg('');
      await switchDemoRole(role, unitId);
      toastSuccess('تم تسجيل الدخول بالحساب التجريبي بنجاح');
      if (role === 'admin' || role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل الدخول السريع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-emerald-50/40 to-sky-50/30 p-4 font-cairo">
      <div className="max-w-md w-full flex flex-col gap-6">
        {/* Hospital Brand Card */}
        <div className="glrs-card p-6 sm:p-8 bg-white border-slate-200 shadow-xl text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 p-2 rounded-2xl bg-white shadow-md border border-slate-100 mb-3 flex items-center justify-center">
              <img
                src={HOSPITAL_INFO.logoUrl}
                alt="Hospital Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">
              {HOSPITAL_INFO.nameAr}
            </h1>
            <p className="text-xs font-semibold text-emerald-800 mt-0.5">
              {HOSPITAL_INFO.nameEn}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-900 text-xs font-bold mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              {HOSPITAL_INFO.systemName}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-right leading-relaxed font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
            <Input
              type="text"
              inputMode="tel"
              dir="auto"
              label="رقم الهاتف"
              placeholder="مثال: 777 111 222 أو +967 7XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              requiredIndicator
              disabled={loading}
            />

            <Input
              type="password"
              label="كلمة المرور"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              requiredIndicator
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              loading={loading}
              icon={<LogIn className="w-4 h-4" />}
            >
              تسجيل الدخول إلى النظام
            </Button>
          </form>

          {/* Demo Quick Access Section (Only in local offline demo mode) */}
          {!isSupabaseConfigured() && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-right">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  الدخول السريع بالحسابات التجريبية:
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  تجربة فورية
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('super_admin')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-right text-xs transition-colors"
                >
                  <p className="font-bold text-purple-900">المسؤول التقني عن المستشفى</p>
                  <p className="text-[10px] text-purple-600">Super Admin (IT والتسويق + كامل الصلاحيات)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/60 text-right text-xs transition-colors"
                >
                  <p className="font-bold text-sky-900">مدير عام المستشفى</p>
                  <p className="text-[10px] text-sky-600">Admin (إطلاع ومتابعة كافة التقارير)</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemoLogin('reporter', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
                  }
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-right text-xs transition-colors"
                >
                  <p className="font-bold text-emerald-900">مسؤول الصيدلية</p>
                  <p className="text-[10px] text-emerald-600">Reporter (نموذج الصيدلية)</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickDemoLogin('reporter', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
                  }
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-right text-xs transition-colors"
                >
                  <p className="font-bold text-amber-900">مشرف التمريض</p>
                  <p className="text-[10px] text-amber-600">Reporter (النموذج العام)</p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500">
          جميع الحقوق محفوظة © {new Date().getFullYear()} {HOSPITAL_INFO.nameAr}
        </p>
      </div>
    </div>
  );
};
