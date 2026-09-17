import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { unitService } from '../../services/unitService';
import { Profile, ReportingUnit } from '../../types';
import { RoleBadge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { UserFormModal } from '../../components/admin/UserFormModal';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../contexts/ToastContext';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Phone,
  Shield
} from 'lucide-react';

export const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [units, setUnits] = useState<ReportingUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const loadUsersData = async () => {
    try {
      setLoading(true);
      const [uList, unitList] = await Promise.all([
        userService.getUsers(),
        unitService.getUnits()
      ]);
      setUsers(uList);
      setUnits(unitList);
    } catch (err: any) {
      toastError(err.message || 'فشل تحميل قائمة المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: Profile) => {
    setEditingUser(u);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (formData: any) => {
    try {
      setActionLoading(true);
      await userService.saveUser(formData);
      success(editingUser ? 'تم تحديث بيانات المستخدم بنجاح' : 'تم إنشاء حساب المستخدم بنجاح');
      await loadUsersData();
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ بيانات المستخدم');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (u: Profile) => {
    try {
      const newState = !u.active;
      await userService.toggleUserActive(u.id, newState);
      success(`تم ${newState ? 'تفعيل' : 'تعطيل'} حساب المستخدم ${u.full_name}`);
      await loadUsersData();
    } catch (err: any) {
      toastError(err.message || 'فشل تغيير حالة الحساب');
    }
  };

  if (loading) {
    return <Spinner size="lg" text="جارٍ استرجاع قائمة المستخدمين..." />;
  }

  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            إدارة مستخدمي النظام والصلاحيات
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إضافة وتعديل حسابات معدي التقارير، مسؤولي الأقسام، والإدارة، والتحكم بحالة الحسابات
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenAdd}
          icon={<UserPlus className="w-4 h-4" />}
        >
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">المستخدم</th>
              <th className="p-3.5">رقم الهاتف</th>
              <th className="p-3.5">الدور / الصلاحية</th>
              <th className="p-3.5">الجهة التابع لها</th>
              <th className="p-3.5">حالة الحساب</th>
              <th className="p-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3.5 font-bold text-slate-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs shrink-0">
                      {u.full_name.charAt(0)}
                    </div>
                    <span>{u.full_name}</span>
                  </div>
                </td>

                <td className="p-3.5 text-slate-600">
                  <div className="flex items-center gap-1.5 justify-start" dir="rtl">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span dir="ltr" className="text-xs font-semibold text-slate-800">
                      {u.phone || '—'}
                    </span>
                  </div>
                </td>

                <td className="p-3.5">
                  <RoleBadge role={u.role} />
                </td>

                <td className="p-3.5 text-slate-700 font-medium">
                  {u.reporting_unit ? (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{u.reporting_unit.name}</span>
                    </div>
                  ) : u.role === 'super_admin' ? (
                    <div className="flex items-center gap-1.5 text-purple-800 font-bold">
                      <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>تقنية المعلومات والتسويق</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">الإدارة العامة والمتابعة</span>
                  )}
                </td>

                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      u.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {u.active ? 'مفعّل' : 'معطل'}
                  </span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="تعديل المستخدم"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        u.active
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={u.active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                    >
                      {u.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveUser}
        user={editingUser}
        units={units}
        loading={actionLoading}
      />
    </div>
  );
};
