import { supabase, isSupabaseConfigured, mockStore } from '../lib/supabase';
import { AuditLog } from '../types';

export const auditService = {
  /**
   * Record an audit log
   */
  async log(action: string, entityType: string, entityId?: string, metadata?: Record<string, any>, userId?: string): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        const uid = userId || (await supabase.auth.getUser()).data.user?.id;
        await supabase.from('audit_logs').insert({
          user_id: uid,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata: metadata || {}
        });
      } else {
        const logs = mockStore.getAuditLogs();
        const profiles = mockStore.getProfiles();
        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata: metadata || {},
          created_at: new Date().toISOString(),
          user: profiles.find(p => p.id === userId)
        };
        logs.unshift(newLog);
        mockStore.saveAuditLogs(logs);
      }
    } catch (e) {
      console.warn('Could not record audit log:', e);
    }
  },

  /**
   * Get recent audit logs
   */
  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, user:profiles(*)')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      const logs = mockStore.getAuditLogs();
      const profiles = mockStore.getProfiles();
      return logs.slice(0, limit).map(l => ({
        ...l,
        user: profiles.find(p => p.id === l.user_id)
      }));
    }
  }
};
