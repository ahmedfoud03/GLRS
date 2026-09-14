import React from 'react';
import { useRouter } from './contexts/RouterContext';
import { useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ReporterDashboard } from './pages/reporter/ReporterDashboard';
import { CreateReportPage } from './pages/reporter/CreateReportPage';
import { EditReportPage } from './pages/reporter/EditReportPage';
import { ViewReportPage } from './pages/reporter/ViewReportPage';
import { MyReportsPage } from './pages/reporter/MyReportsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllReportsPage } from './pages/admin/AllReportsPage';
import { UnsubmittedUnitsPage } from './pages/admin/UnsubmittedUnitsPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { ManageUnitsPage } from './pages/admin/ManageUnitsPage';
import { ManageTemplatesPage } from './pages/admin/ManageTemplatesPage';
import { EditTemplateFieldsPage } from './pages/admin/EditTemplateFieldsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Button } from './components/common/Button';
import { Link } from './components/common/Link';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { path } = useRouter();
  const { user } = useAuth();

  // Route matching logic
  const renderRoute = () => {
    // 1. Auth Page
    if (path === '/login') {
      return <LoginPage />;
    }

    if (path === '/reports/new') {
      return (
        <ProtectedRoute>
          <MainLayout>
            <CreateReportPage />
          </MainLayout>
        </ProtectedRoute>
      );
    }

    // 2. Report Details / Edit routes with ID
    const reportEditMatch = path.match(/^\/reports\/([^/]+)\/edit$/);
    if (reportEditMatch) {
      const id = reportEditMatch[1];
      return (
        <ProtectedRoute>
          <MainLayout>
            <EditReportPage reportId={id} />
          </MainLayout>
        </ProtectedRoute>
      );
    }

    const reportViewMatch = path.match(/^\/reports\/([^/]+)$/) || path.match(/^\/admin\/reports\/([^/]+)$/);
    if (reportViewMatch) {
      const id = reportViewMatch[1];
      return (
        <ProtectedRoute>
          <MainLayout>
            <ViewReportPage reportId={id} />
          </MainLayout>
        </ProtectedRoute>
      );
    }

    // 3. Template Fields Route with ID
    const templateFieldsMatch = path.match(/^\/admin\/templates\/([^/]+)\/fields$/);
    if (templateFieldsMatch) {
      const id = templateFieldsMatch[1];
      return (
        <ProtectedRoute requireSuperAdmin>
          <MainLayout>
            <EditTemplateFieldsPage templateId={id} />
          </MainLayout>
        </ProtectedRoute>
      );
    }

    // 4. Exact Route Matching
    switch (path) {
      case '/':
      case '/dashboard':
      case '/admin':
      case '/admin/dashboard':
        return (
          <ProtectedRoute>
            <MainLayout>
              {user?.profile.role === 'reporter' ? <ReporterDashboard /> : <AdminDashboard />}
            </MainLayout>
          </ProtectedRoute>
        );

      case '/my-reports':
        return (
          <ProtectedRoute>
            <MainLayout>
              <MyReportsPage />
            </MainLayout>
          </ProtectedRoute>
        );

      case '/admin/reports':
        return (
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <AllReportsPage />
            </MainLayout>
          </ProtectedRoute>
        );

      case '/admin/unsubmitted':
        return (
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <UnsubmittedUnitsPage />
            </MainLayout>
          </ProtectedRoute>
        );

      case '/admin/users':
        return (
          <ProtectedRoute requireSuperAdmin>
            <MainLayout>
              <ManageUsersPage />
            </MainLayout>
          </ProtectedRoute>
        );

      case '/admin/units':
        return (
          <ProtectedRoute requireSuperAdmin>
            <MainLayout>
              <ManageUnitsPage />
            </MainLayout>
          </ProtectedRoute>
        );

      case '/admin/templates':
        return (
          <ProtectedRoute requireSuperAdmin>
            <MainLayout>
              <ManageTemplatesPage />
            </MainLayout>
          </ProtectedRoute>
        );

      case '/admin/audit':
        return (
          <ProtectedRoute requireSuperAdmin>
            <MainLayout>
              <AuditLogsPage />
            </MainLayout>
          </ProtectedRoute>
        );

      case '/settings':
        return (
          <ProtectedRoute>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </ProtectedRoute>
        );

      default:
        return (
          <MainLayout>
            <div className="p-12 max-w-md mx-auto text-center text-right">
              <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">الصفحة غير موجودة (404)</h3>
                <p className="text-xs text-slate-500 mb-6">
                  الرابط المطلوب غير متوفر أو تم نقله.
                </p>
                <Link to="/dashboard">
                  <Button variant="primary" size="sm">
                    العودة للرئيسية
                  </Button>
                </Link>
              </div>
            </div>
          </MainLayout>
        );
    }
  };

  return <>{renderRoute()}</>;
};
