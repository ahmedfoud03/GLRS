import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { RoleBadge } from '../components/common/Badge';
import { HOSPITAL_INFO } from '../lib/constants';
import { isSupabaseConfigured } from '../lib/supabase';
import { formatArabicDate, getTodayDateString } from '../utils/dateUtils';
import { 
  LogOut, 
  User, 
  Calendar, 
  Menu, 
  Building2, 
  ChevronDown,
  Sparkles,
  Shield
} from 'lucide-react';
import { Link } from '../components/common/Link';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const { navigate } = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  const demoMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close both menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (demoMenuRef.current && !demoMenuRef.current.contains(target)) {
        setIsDemoMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const todayStr = getTodayDateString();

  return (
    <header className="header-navbar bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3">
        {/* Left / Start: Brand & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            title="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 text-inherit no-underline">
            <img
              src={HOSPITAL_INFO.logoUrl}
              alt="Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm"
            />
            <div className="hidden sm:block text-right">
              <h1 className="text-sm font-black text-slate-900 leading-tight">
                {HOSPITAL_INFO.nameAr}
              </h1>
              <p className="text-[11px] font-semibold text-emerald-700">
                {HOSPITAL_INFO.systemName}
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Today's Date Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-emerald-700" />
          <span>{formatArabicDate(todayStr)}</span>
        </div>

        {/* Right / End: User Profile & Demo Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Role Switcher (Hidden when live database is active) */}
          {!isSupabaseConfigured() && (
            <div className="relative" ref={demoMenuRef}>
              <button
                type="button"
                onClick={() => { setIsDemoMenuOpen(prev => !prev); setIsUserMenuOpen(false); }}
                className="flex items-center gap-1.5 min-h-10 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                title="تبديل الدور للتجربة"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">تبديل الحساب التجريبي</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isDemoMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-[calc(100vw-1.5rem)] max-w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-right animate-fadeIn"
                  onClick={() => setIsDemoMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                    اختر الحساب والدور للمعاينة الفورية:
                  </div>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('super_admin')}
                    className="w-full px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex flex-col text-right">
                      <span className="font-bold">المسؤول التقني</span>
                      <span className="text-[10px] text-purple-700">تقنية المعلومات والتسويق</span>
                    </div>
                    <RoleBadge role="super_admin" />
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDemoRole('admin')}
                    className="w-full px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex flex-col text-right">
                      <span className="font-bold">د. خالد العمري</span>
                      <span className="text-[10px] text-sky-700">مدير عام المستشفى</span>
                    </div>
                    <RoleBadge role="admin" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      switchDemoRole('reporter', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
                    }
                    className="w-full px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="font-bold">مسؤول الصيدلية</span>
                    <RoleBadge role="reporter" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      switchDemoRole('reporter', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
                    }
                    className="w-full px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="font-bold">مشرف التمريض</span>
                    <RoleBadge role="reporter" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      switchDemoRole('reporter', '77777777-7777-7777-7777-777777777777')
                    }
                    className="w-full px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="font-bold">المستلم الليلي</span>
                    <RoleBadge role="reporter" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Profile Pill */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => { setIsUserMenuOpen(prev => !prev); setIsDemoMenuOpen(false); }}
                className="flex items-center gap-2.5 min-h-10 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-sky-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                  {user.profile.full_name.charAt(0)}
                </div>

                <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user.profile.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {user.profile.reporting_unit?.name || 'إدارة المستشفى'}
                  </p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-[calc(100vw-1.5rem)] max-w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-right animate-fadeIn"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{user.profile.full_name}</p>
                    {user.profile.phone && (
                      <p className="text-[11px] text-slate-500 truncate" dir="ltr">{user.profile.phone}</p>
                    )}
                    <div className="mt-1.5">
                      <RoleBadge role={user.profile.role} />
                    </div>
                  </div>

                  {user.profile.reporting_unit && (
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{user.profile.reporting_unit.name}</span>
                    </div>
                  )}

                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>إعدادات الحساب والنظام</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
