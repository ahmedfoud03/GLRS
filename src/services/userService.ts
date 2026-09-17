import { supabase, isSupabaseConfigured, mockStore } from '../lib/supabase';
import { Profile, UserRole } from '../types';
import { authService } from './authService';

export const userService = {
  /**
   * Get all users / profiles
   */
  async getUsers(): Promise<Profile[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, reporting_unit:reporting_units(*)')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      const profiles = mockStore.getProfiles();
      const units = mockStore.getUnits();
      return profiles.map(p => ({
        ...p,
        reporting_unit: units.find(u => u.id === p.reporting_unit_id) || null
      }));
    }
  },

  /**
   * Save (create / update) user profile
   */
  async saveUser(user: {
    id?: string;
    full_name: string;
    email?: string;
    phone?: string;
    reporting_unit_id?: string;
    role: UserRole;
    active?: boolean;
    password?: string;
  }): Promise<Profile> {
    if (isSupabaseConfigured()) {
      if (user.id) {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            full_name: user.full_name,
            phone: user.phone,
            reporting_unit_id: user.reporting_unit_id || null,
            role: user.role,
            active: user.active ?? true
          })
          .eq('id', user.id)
          .select('*, reporting_unit:reporting_units(*)')
          .single();
        if (error) throw new Error(error.message);
        return data;
      } else {
        if (!user.phone?.trim()) {
          throw new Error('رقم الهاتف مطلوب لإنشاء حساب المستخدم.');
        }

        // 1. Try atomic admin RPC (keeps super_admin logged in, confirms user immediately)
        const { data: rpcData, error: rpcErr } = await supabase.rpc('admin_create_user', {
          p_phone: user.phone.trim(),
          p_full_name: user.full_name.trim(),
          p_role: user.role,
          p_unit_id: user.reporting_unit_id || null,
          p_password: user.password || 'Glrs@2026'
        });

        if (!rpcErr && rpcData) {
          const { data: fullProf } = await supabase
            .from('profiles')
            .select('*, reporting_unit:reporting_units(*)')
            .eq('id', rpcData.id)
            .single();
          return fullProf || rpcData;
        }

        // If RPC returned a business error (e.g. duplicate phone, permission), surface it
        if (rpcErr && !rpcErr.message.toLowerCase().includes('function') && !rpcErr.message.toLowerCase().includes('not found')) {
          throw new Error(rpcErr.message);
        }

        // 2. Fallback to client signup if RPC is not yet created in SQL
        const cleanDigits = user.phone.replace(/[\s\-()+]/g, '');
        const virtualEmail = `${cleanDigits}@glrs.internal`;
        const normalizedPhone = authService.normalizePhone(user.phone);

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: virtualEmail,
          password: user.password || 'Glrs@2026',
          options: {
            data: {
              full_name: user.full_name,
              phone: normalizedPhone,
              role: user.role
            }
          }
        });
        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error('فشل إنشاء المستخدم');

        // Update profile with specific unit assignment
        const { data: updatedProf, error: profErr } = await supabase
          .from('profiles')
          .update({
            full_name: user.full_name,
            phone: user.phone,
            reporting_unit_id: user.reporting_unit_id || null,
            role: user.role,
            active: user.active ?? true
          })
          .eq('id', authData.user.id)
          .select('*, reporting_unit:reporting_units(*)')
          .single();

        if (profErr) {
          // If trigger didn't fire yet, insert directly
          const { data: insertedProf, error: insErr } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              full_name: user.full_name,
              email: user.email || null,
              phone: user.phone,
              reporting_unit_id: user.reporting_unit_id || null,
              role: user.role,
              active: user.active ?? true
            })
            .select('*, reporting_unit:reporting_units(*)')
            .single();
          if (insErr) throw new Error(insErr.message);
          return insertedProf;
        }
        return updatedProf;
      }
    } else {
      const profiles = mockStore.getProfiles();
      const units = mockStore.getUnits();
      if (user.id) {
        const index = profiles.findIndex(p => p.id === user.id);
        if (index === -1) throw new Error('User not found');
        const updated: Profile = {
          ...profiles[index],
          full_name: user.full_name,
          phone: user.phone,
          reporting_unit_id: user.reporting_unit_id || null,
          role: user.role,
          active: user.active !== undefined ? user.active : profiles[index].active,
          updated_at: new Date().toISOString()
        };
        profiles[index] = updated;
        mockStore.saveProfiles(profiles);
        return {
          ...updated,
          reporting_unit: units.find(u => u.id === updated.reporting_unit_id) || null
        };
      } else {
        const newProf: Profile = {
          id: 'user-' + Date.now(),
          full_name: user.full_name,
          email: user.email || '',
          phone: user.phone,
          reporting_unit_id: user.reporting_unit_id || null,
          role: user.role,
          active: user.active !== undefined ? user.active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        profiles.push(newProf);
        mockStore.saveProfiles(profiles);
        return {
          ...newProf,
          reporting_unit: units.find(u => u.id === newProf.reporting_unit_id) || null
        };
      }
    }
  },

  /**
   * Toggle user active status
   */
  async toggleUserActive(id: string, active: boolean): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('profiles').update({ active }).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const profiles = mockStore.getProfiles();
      const index = profiles.findIndex(p => p.id === id);
      if (index !== -1) {
        profiles[index].active = active;
        profiles[index].updated_at = new Date().toISOString();
        mockStore.saveProfiles(profiles);
      }
    }
  }
};
