import React, { useState, useEffect } from 'react';
import { Profile, ReportingUnit, UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../contexts/ToastContext';
import { User, Phone, Building2, Shield, Lock } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => Promise<void>;
  user?: Profile | null;
  units: ReportingUnit[];
  loading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  units,
  loading = false
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('reporter');
  const [reportingUnitId, setReportingUnitId] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { error: toastError } = useToast();

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setRole(user.role || 'reporter');
      setReportingUnitId(user.reporting_unit_id || '');
      setActive(user.active !== undefined ? user.active : true);
      setPassword('');
    } else {
      setFullName('');
      setPhone('');
      setRole('reporter');
      setReportingUnitId(units[0]?.id || '');
      setActive(true);
      setPassword('Glrs@2026');
    }
    setErrors({});
  }, [user, units, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'يرجى كتابة الاسم الكامل للمستخدم.';
    if (!phone.trim()) newErrors.phone = 'يرجى إدخال رقم الهاتف.';
    if (!user && (!password || password.length < 6)) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        id: user?.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        role,
        reporting_unit_id: (role === 'reporter' || role === 'super_admin') ? reportingUnitId || null : null,
        active,
        password: password || undefined
      });
      onClose();
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ بيانات المستخدم');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد للنظام'}
      subtitle="إدارة حسابات الموظفين والصلاحيات والأقسام التابعة لهم"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
        <Input
          label="الاسم الكامل"
          placeholder="مثال: د. أحمد يحيى الشميري"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          requiredIndicator
          disabled={loading}
        />

        <div className="grid grid-cols-1">
          <Input
            type="tel"
            label="رقم الهاتف"
            placeholder="+967 777 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            requiredIndicator
            disabled={loading}
          />
        </div>

        {!user && (
          <Input
            type="password"
            label="كلمة المرور الابتدائية"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            requiredIndicator
            helperText="كلمة المرور الافتراضية: Glrs@2026"
            disabled={loading}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 w-full text-right">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              الدور والصلاحية <span className="text-rose-600 font-bold">*</span>
            </label>
            <select
              className="glrs-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={loading}
            >
              <option value="reporter">مُعد تقرير (قسم/خدمة)</option>
              <option value="admin">مدير عام المستشفى (Admin - إطلاع ومتابعة)</option>
              <option value="super_admin">المسؤول التقني (Super Admin - تقنية المعلومات والتسويق)</option>
            </select>
          </div>

          {(role === 'reporter' || role === 'super_admin') && (
            <div className="flex flex-col gap-1.5 w-full text-right">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {role === 'super_admin' ? 'القسم الأساسي (تقنية المعلومات / التسويق)' : 'الجهة التابع لها'}{' '}
                <span className="text-rose-600 font-bold">*</span>
              </label>
              <select
                className="glrs-select"
                value={reportingUnitId}
                onChange={(e) => setReportingUnitId(e.target.value)}
                disabled={loading}
              >
                <option value="">-- اختر الجهة أو القسم --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="user-active-chk"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded"
            disabled={loading}
          />
          <label htmlFor="user-active-chk" className="text-xs font-bold text-slate-700 cursor-pointer">
            الحساب نشط ومفعّل (يمكنه تسجيل الدخول للنظام)
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {user ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
