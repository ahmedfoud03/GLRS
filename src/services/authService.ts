import { supabase, isSupabaseConfigured, mockStore } from '../lib/supabase';
import { Profile, AuthUser } from '../types';

export const authService = {
  normalizePhone(phone: string): string {
    return phone.replace(/[\s\-()]/g, '');
  },

  /**
   * Log in user with phone number or email and password
   */
  async login(identifier: string, password: string): Promise<AuthUser> {
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes('@');

    if (isSupabaseConfigured()) {
      let authResponse;
      if (isEmail) {
        authResponse = await supabase.auth.signInWithPassword({
          email: trimmed.toLowerCase(),
          password
        });
      } else {
        const normalizedPhone = this.normalizePhone(trimmed);
        authResponse = await supabase.auth.signInWithPassword({
          phone: normalizedPhone,
          password
        });
      }

      const { data, error } = authResponse;
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('بيانات الدخول غير صحيحة (اسم المستخدم أو كلمة المرور).');
        }
        throw new Error(error.message);
      }
      if (!data.user) throw new Error('فشل تسجيل الدخول، يرجى المحاولة لاحقاً');

      // Fetch Profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*, reporting_unit:reporting_units(*)')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profile) {
        throw new Error('لم يتم العثور على الملف التعريفي الخاص بحسابك. يرجى مراجعة إدارة النظام.');
      }

      if (!profile.active) {
        await supabase.auth.signOut();
        throw new Error('هذا الحساب معطل حالياً من قبل إدارة المستشفى. يرجى التواصل مع الإدارة.');
      }

      return {
        id: data.user.id,
        email: data.user.email || profile.email,
        profile: profile as Profile
      };
    } else {
      // Mock / Demo Mode
      const normalizedPhone = this.normalizePhone(trimmed);
      const profiles = mockStore.getProfiles();
      const units = mockStore.getUnits();
      const foundProfile = profiles.find(p => 
        (p.email && p.email.toLowerCase() === trimmed.toLowerCase()) ||
        this.normalizePhone(p.phone || '') === normalizedPhone
      );

      if (!foundProfile) {
        throw new Error('بيانات الدخول غير صحيحة، أو لم يتم العثور على الحساب التجريبي.');
      }

      if (!foundProfile.active) {
        throw new Error('هذا الحساب معطل حالياً من قبل إدارة المستشفى.');
      }

      const passwords = JSON.parse(localStorage.getItem('glrs_demo_passwords') || '{}') as Record<string, string>;
      if ((passwords[foundProfile.id] || 'Glrs@2026') !== password) {
        throw new Error('بيانات الدخول غير صحيحة.');
      }

      const assignedUnit = units.find(u => u.id === foundProfile.reporting_unit_id) || null;
      const fullProfile: Profile = {
        ...foundProfile,
        reporting_unit: assignedUnit
      };

      const user: AuthUser = {
        id: foundProfile.id,
        email: foundProfile.email,
        profile: fullProfile
      };

      localStorage.setItem('glrs_active_user', JSON.stringify(user));
      return user;
    }
  },

  /** Update the password for the authenticated user. */
  async updatePassword(password: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      return;
    }

    const stored = localStorage.getItem('glrs_active_user');
    if (!stored) throw new Error('يرجى تسجيل الدخول أولاً.');
    const user = JSON.parse(stored) as AuthUser;
    const passwords = JSON.parse(localStorage.getItem('glrs_demo_passwords') || '{}') as Record<string, string>;
    passwords[user.id] = password;
    localStorage.setItem('glrs_demo_passwords', JSON.stringify(passwords));
  },

  /**
   * Get current session and profile
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (isSupabaseConfigured()) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*, reporting_unit:reporting_units(*)')
        .eq('id', session.user.id)
        .single();

      if (profileErr || !profile || !profile.active) return null;

      return {
        id: session.user.id,
        email: session.user.email || profile.email,
        profile: profile as Profile
      };
    } else {
      try {
        const stored = localStorage.getItem('glrs_active_user');
        if (!stored) {
          // Default to Super Admin for seamless preview
          const profiles = mockStore.getProfiles();
          const units = mockStore.getUnits();
          const defaultProf = profiles[0]; // super admin
          const assignedUnit = units.find(u => u.id === defaultProf.reporting_unit_id) || null;
          const user: AuthUser = {
            id: defaultProf.id,
            email: defaultProf.email,
            profile: { ...defaultProf, reporting_unit: assignedUnit }
          };
          localStorage.setItem('glrs_active_user', JSON.stringify(user));
          return user;
        }
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  },

  /**
   * Fast Demo Switcher for testing all roles seamlessly
   */
  async switchDemoUser(role: 'reporter' | 'admin' | 'super_admin', unitId?: string): Promise<AuthUser> {
    const profiles = mockStore.getProfiles();
    const units = mockStore.getUnits();
    let target = profiles.find(p => p.role === role && (!unitId || p.reporting_unit_id === unitId));
    if (!target) target = profiles.find(p => p.role === role) || profiles[0];

    const assignedUnit = units.find(u => u.id === target!.reporting_unit_id) || null;
    const user: AuthUser = {
      id: target!.id,
      email: target!.email,
      profile: { ...target!, reporting_unit: assignedUnit }
    };
    localStorage.setItem('glrs_active_user', JSON.stringify(user));
    return user;
  },

  /**
   * Log out
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('glrs_active_user');
  }
};
