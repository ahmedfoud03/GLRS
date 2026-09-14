import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (phone: string, pass: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole, unitId?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isReporter: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canAccessAdmin: boolean;
  canSubmitReports: boolean;
  isHospitalDirector: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error('Auth initialization error:', err);
      setError(err.message || 'فشل في استعادة جلسة المستخدم');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (phone: string, pass: string): Promise<AuthUser> => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await authService.login(phone, pass);
      setUser(authUser);
      return authUser;
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (role: UserRole, unitId?: string) => {
    setLoading(true);
    try {
      const switched = await authService.switchDemoUser(role, unitId);
      setUser(switched);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const refreshed = await authService.getCurrentUser();
    setUser(refreshed);
  };

  const role = user?.profile?.role;
  const isReporter = role === 'reporter';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isHospitalDirector = role === 'admin';
  const isSuperAdmin = role === 'super_admin';
  const canAccessAdmin = isAdmin || isSuperAdmin;
  const canSubmitReports = isReporter || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        switchDemoRole,
        refreshUser,
        isReporter,
        isAdmin,
        isSuperAdmin,
        canAccessAdmin,
        canSubmitReports,
        isHospitalDirector
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
