import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { Spinner } from '../common/Spinner';
import { UserRole } from '../../types';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Button } from '../common/Button';
import { Link } from '../common/Link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAdmin = false,
  requireSuperAdmin = false
}) => {
  const { user, loading, isSuperAdmin, isAdmin } = useAuth();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" text="جارٍ التحقق من الصلاحيات والبيانات..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-right">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">يتطلب تسجيل الدخول</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            يجب تسجيل الدخول بحساب مصرح له للوصول إلى نظام إدارة التقارير اليومية.
          </p>
          <Link to="/login" className="w-full">
            <Button variant="primary" className="w-full" icon={<LogIn className="w-4 h-4" />}>
              الانتقال إلى صفحة تسجيل الدخول
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const role = user.profile.role;

  // Check role constraints
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-rose-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">صلاحية غير كافية</h3>
          <p className="text-xs text-slate-500 mb-6">
            عذراً، هذه الصفحة مخصصة لمدير النظام الرئيسي (Super Admin) فقط.
          </p>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              العودة إلى لوحة التحكم
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-rose-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">صلاحية غير كافية</h3>
          <p className="text-xs text-slate-500 mb-6">
            عذراً، هذه الصفحة مخصصة لإدارة المستشفى فقط.
          </p>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              العودة إلى لوحة التحكم
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-rose-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">غير مصرح بالوصول</h3>
          <p className="text-xs text-slate-500 mb-6">
            لا تملك الصلاحية المطلوبة لعرض هذه الصفحة.
          </p>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              العودة إلى لوحة التحكم
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
