import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { Link } from '../components/common/Link';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  Layers, 
  Users, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Settings, 
  LogOut, 
  HelpCircle,
  Sliders
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isReporter, isAdmin, isSuperAdmin, isHospitalDirector, logout } = useAuth();
  const { path, navigate } = useRouter();

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate('/login');
  };

  const isActive = (route: string) => {
    if (route === '/dashboard' && (path === '/' || path === '/dashboard')) return true;
    if (route === '/admin' && (path === '/admin' || path === '/admin/dashboard')) return true;
    return path.startsWith(route) && route !== '/';
  };

  const navItemClass = (route: string) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150
    ${
      isActive(route)
        ? 'bg-emerald-700 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          sidebar fixed lg:sticky top-0 lg:top-[61px] bottom-0 right-0 z-40 w-64 bg-white border-l border-slate-200
          flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          h-screen lg:h-[calc(100vh-61px)] p-4 text-right
        `}
      >
        <div className="flex flex-col gap-6">
          {/* 1. Reporter Navigation Section */}
          {isReporter && (
            <div>
              <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                لوحة مُعد التقرير
              </span>
              <div className="flex flex-col gap-1">
                <Link to="/dashboard" className={navItemClass('/dashboard')} onClick={onClose}>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>الرئيسية (لوحة التحكم)</span>
                </Link>

                <Link to="/reports/new" className={navItemClass('/reports/new')} onClick={onClose}>
                  <FilePlus className="w-4 h-4 shrink-0" />
                  <span>إنشاء / متابعة تقرير اليوم</span>
                </Link>

                <Link to="/my-reports" className={navItemClass('/my-reports')} onClick={onClose}>
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>أرشيف تقاريري السابقة</span>
                </Link>
              </div>
            </div>
          )}

          {/* 2. General Hospital Director Navigation (Admin - Views all, does NOT submit reports) */}
          {isHospitalDirector && (
            <div>
              <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                إدارة المستشفى والمتابعة
              </span>
              <div className="flex flex-col gap-1">
                <Link to="/dashboard" className={navItemClass('/dashboard')} onClick={onClose}>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>الرئيسية (لوحة المتابعة الشاملة)</span>
                </Link>

                <Link
                  to="/admin/unsubmitted"
                  className={navItemClass('/admin/unsubmitted')}
                  onClick={onClose}
                >
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>كشف من لم يرفع التقرير</span>
                </Link>

                <Link
                  to="/admin/reports"
                  className={navItemClass('/admin/reports')}
                  onClick={onClose}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>جميع تقارير المستشفى</span>
                </Link>
              </div>
            </div>
          )}

          {/* 3. Super Admin Navigation (Technical Officer - Full control + IT & Marketing reports) */}
          {isSuperAdmin && (
            <>
              {/* Dashboard & IT/Marketing Reporting */}
              <div>
                <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  تقارير تقنية المعلومات والتسويق
                </span>
                <div className="flex flex-col gap-1">
                  <Link to="/dashboard" className={navItemClass('/dashboard')} onClick={onClose}>
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>الرئيسية (لوحة المتابعة)</span>
                  </Link>

                  <Link to="/reports/new" className={navItemClass('/reports/new')} onClick={onClose}>
                    <FilePlus className="w-4 h-4 shrink-0" />
                    <span>إنشاء تقرير اليوم (IT / تسويق)</span>
                  </Link>

                  <Link to="/my-reports" className={navItemClass('/my-reports')} onClick={onClose}>
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>أرشيف تقارير القسمين</span>
                  </Link>
                </div>
              </div>

              {/* Reports Oversight */}
              <div>
                <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  إدارة التقارير والرقابة
                </span>
                <div className="flex flex-col gap-1">
                  <Link
                    to="/admin/unsubmitted"
                    className={navItemClass('/admin/unsubmitted')}
                    onClick={onClose}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span>كشف من لم يرفع التقرير</span>
                  </Link>

                  <Link
                    to="/admin/reports"
                    className={navItemClass('/admin/reports')}
                    onClick={onClose}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>جميع تقارير المستشفى</span>
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Super Admin Management Section */}
          {isSuperAdmin && (
            <div>
              <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                إدارة النظام والإعدادات
              </span>
              <div className="flex flex-col gap-1">
                <Link
                  to="/admin/users"
                  className={navItemClass('/admin/users')}
                  onClick={onClose}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>إدارة المستخدمين والحسابات</span>
                </Link>

                <Link
                  to="/admin/units"
                  className={navItemClass('/admin/units')}
                  onClick={onClose}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>إدارة الجهات والأقسام</span>
                </Link>

                <Link
                  to="/admin/templates"
                  className={navItemClass('/admin/templates')}
                  onClick={onClose}
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>إدارة قوالب واستمارات التقارير</span>
                </Link>

                <Link
                  to="/admin/audit"
                  className={navItemClass('/admin/audit')}
                  onClick={onClose}
                >
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>سجل العمليات والتدقيق</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-1">
          <Link to="/settings" className={navItemClass('/settings')} onClick={onClose}>
            <Settings className="w-4 h-4 shrink-0" />
            <span>إعدادات الحساب</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};
