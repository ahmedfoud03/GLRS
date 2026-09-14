import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { Link } from '../components/common/Link';
import { LayoutDashboard, FilePlus, FileText, Settings, HelpCircle, Layers } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { isReporter, isAdmin, isSuperAdmin, isHospitalDirector } = useAuth();
  const { path } = useRouter();

  const isActive = (route: string) => {
    if (route === '/dashboard' && (path === '/' || path === '/dashboard')) return true;
    if (route === '/admin' && (path === '/admin' || path === '/admin/dashboard')) return true;
    return path.startsWith(route) && route !== '/';
  };

  const itemClass = (route: string) => `
    flex min-h-14 flex-col items-center justify-center py-2 px-1 text-[10px] font-bold flex-1 transition-colors
    ${isActive(route) ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'}
  `;

  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 lg:hidden shadow-lg flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]">
      <Link to="/dashboard" className={itemClass('/dashboard')}>
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>الرئيسية</span>
      </Link>

      {/* Admin (General Director) does not submit reports */}
      {isHospitalDirector ? (
        <>
          <Link to="/admin/unsubmitted" className={itemClass('/admin/unsubmitted')}>
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span>من لم يرفع</span>
          </Link>

          <Link to="/admin/reports" className={itemClass('/admin/reports')}>
            <Layers className="w-5 h-5 mb-0.5" />
            <span>التقارير</span>
          </Link>
        </>
      ) : (
        <>
          <Link to="/reports/new" className={itemClass('/reports/new')}>
            <FilePlus className="w-5 h-5 mb-0.5" />
            <span>{isSuperAdmin ? 'رفع تقرير' : 'تقرير اليوم'}</span>
          </Link>

          {isSuperAdmin ? (
            <Link to="/admin/reports" className={itemClass('/admin/reports')}>
              <Layers className="w-5 h-5 mb-0.5" />
              <span>التقارير</span>
            </Link>
          ) : (
            <Link to="/my-reports" className={itemClass('/my-reports')}>
              <FileText className="w-5 h-5 mb-0.5" />
              <span>تقاريري</span>
            </Link>
          )}
        </>
      )}

      <Link to="/settings" className={itemClass('/settings')}>
        <Settings className="w-5 h-5 mb-0.5" />
        <span>الإعدادات</span>
      </Link>
    </nav>
  );
};
