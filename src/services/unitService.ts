import { supabase, isSupabaseConfigured, mockStore } from '../lib/supabase';
import { ReportingUnit } from '../types';

export const unitService = {
  /**
   * Get all active reporting units
   */
  async getUnits(includeInactive: boolean = false): Promise<ReportingUnit[]> {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('reporting_units')
        .select('*, report_template:report_templates(*)')
        .order('name', { ascending: true });

      if (!includeInactive) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      const units = mockStore.getUnits();
      const templates = mockStore.getTemplates();
      return units
        .filter(u => includeInactive || u.active)
        .map(u => ({
          ...u,
          report_template: templates.find(t => t.id === u.report_template_id) || null
        }));
    }
  },

  /**
   * Get unit by ID
   */
  async getUnitById(id: string): Promise<ReportingUnit | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('reporting_units')
        .select('*, report_template:report_templates(*)')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    } else {
      const units = mockStore.getUnits();
      const templates = mockStore.getTemplates();
      const unit = units.find(u => u.id === id);
      if (!unit) return null;
      return {
        ...unit,
        report_template: templates.find(t => t.id === unit.report_template_id) || null
      };
    }
  },

  /**
   * Create or update reporting unit
   */
  async saveUnit(unit: Partial<ReportingUnit>): Promise<ReportingUnit> {
    if (isSupabaseConfigured()) {
      if (unit.id) {
        const { data, error } = await supabase
          .from('reporting_units')
          .update({
            name: unit.name,
            code: unit.code,
            type: unit.type,
            description: unit.description,
            report_template_id: unit.report_template_id,
            active: unit.active
          })
          .eq('id', unit.id)
          .select('*, report_template:report_templates(*)')
          .single();
        if (error) throw new Error(error.message);
        return data;
      } else {
        const { data, error } = await supabase
          .from('reporting_units')
          .insert({
            name: unit.name,
            code: unit.code,
            type: unit.type || 'department',
            description: unit.description,
            report_template_id: unit.report_template_id,
            active: unit.active ?? true
          })
          .select('*, report_template:report_templates(*)')
          .single();
        if (error) throw new Error(error.message);
        return data;
      }
    } else {
      const units = mockStore.getUnits();
      const templates = mockStore.getTemplates();
      if (unit.id) {
        const index = units.findIndex(u => u.id === unit.id);
        if (index === -1) throw new Error('Unit not found');
        const updated: ReportingUnit = {
          ...units[index],
          ...unit,
          updated_at: new Date().toISOString()
        } as ReportingUnit;
        units[index] = updated;
        mockStore.saveUnits(units);
        return {
          ...updated,
          report_template: templates.find(t => t.id === updated.report_template_id) || null
        };
      } else {
        const newUnit: ReportingUnit = {
          id: 'unit-' + Date.now(),
          name: unit.name || 'جهة جديدة',
          code: unit.code || 'UNIT-' + Math.floor(100 + Math.random() * 900),
          type: unit.type || 'department',
          description: unit.description || '',
          report_template_id: unit.report_template_id || null,
          active: unit.active !== undefined ? unit.active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        units.push(newUnit);
        mockStore.saveUnits(units);
        return {
          ...newUnit,
          report_template: templates.find(t => t.id === newUnit.report_template_id) || null
        };
      }
    }
  },

  /**
   * Toggle active state
   */
  async toggleUnitActive(id: string, active: boolean): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('reporting_units').update({ active }).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const units = mockStore.getUnits();
      const index = units.findIndex(u => u.id === id);
      if (index !== -1) {
        units[index].active = active;
        units[index].updated_at = new Date().toISOString();
        mockStore.saveUnits(units);
      }
    }
  }
};
