import { supabase, isSupabaseConfigured, mockStore } from '../lib/supabase';
import { ReportTemplate, ReportField } from '../types';

export const templateService = {
  /**
   * Get all active templates
   */
  async getTemplates(includeInactive: boolean = false): Promise<ReportTemplate[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('report_templates').select('*, fields:report_fields(*)').order('created_at', { ascending: true });
      if (!includeInactive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      const templates = mockStore.getTemplates();
      const allFields = mockStore.getFields();
      return templates
        .filter(t => includeInactive || t.active)
        .map(t => ({
          ...t,
          fields: allFields.filter(f => f.template_id === t.id).sort((a, b) => a.sort_order - b.sort_order)
        }));
    }
  },

  /**
   * Get template by ID with its fields
   */
  async getTemplateById(id: string): Promise<ReportTemplate | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*, fields:report_fields(*)')
        .eq('id', id)
        .single();
      if (error) return null;
      if (data && data.fields) {
        data.fields.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }
      return data;
    } else {
      const templates = mockStore.getTemplates();
      const allFields = mockStore.getFields();
      const t = templates.find(item => item.id === id);
      if (!t) return null;
      return {
        ...t,
        fields: allFields.filter(f => f.template_id === id).sort((a, b) => a.sort_order - b.sort_order)
      };
    }
  },

  /**
   * Create or update template
   */
  async saveTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    if (isSupabaseConfigured()) {
      if (template.id) {
        const { data, error } = await supabase
          .from('report_templates')
          .update({
            name: template.name,
            description: template.description,
            active: template.active,
            is_default: template.is_default
          })
          .eq('id', template.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      } else {
        const { data, error } = await supabase
          .from('report_templates')
          .insert({
            name: template.name,
            description: template.description,
            active: template.active ?? true,
            is_default: template.is_default ?? false
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }
    } else {
      const templates = mockStore.getTemplates();
      if (template.id) {
        const index = templates.findIndex(t => t.id === template.id);
        if (index === -1) throw new Error('Template not found');
        const updated: ReportTemplate = {
          ...templates[index],
          ...template,
          updated_at: new Date().toISOString()
        } as ReportTemplate;
        templates[index] = updated;
        mockStore.saveTemplates(templates);
        return updated;
      } else {
        const newTemplate: ReportTemplate = {
          id: 'tpl-' + Date.now(),
          name: template.name || 'قالب جديد',
          description: template.description || '',
          is_default: template.is_default || false,
          active: template.active !== undefined ? template.active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          fields: []
        };
        templates.push(newTemplate);
        mockStore.saveTemplates(templates);
        return newTemplate;
      }
    }
  },

  /**
   * Save / Update a field
   */
  async saveField(field: Partial<ReportField>): Promise<ReportField> {
    if (isSupabaseConfigured()) {
      if (field.id && !field.id.startsWith('temp-')) {
        const { data, error } = await supabase
          .from('report_fields')
          .update({
            field_name: field.field_name,
            field_label: field.field_label,
            field_type: field.field_type,
            placeholder: field.placeholder,
            required: field.required,
            sort_order: field.sort_order,
            options: field.options || []
          })
          .eq('id', field.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      } else {
        const { data, error } = await supabase
          .from('report_fields')
          .insert({
            template_id: field.template_id!,
            field_name: field.field_name!,
            field_label: field.field_label!,
            field_type: field.field_type || 'textarea',
            placeholder: field.placeholder,
            required: field.required ?? false,
            sort_order: field.sort_order ?? 0,
            options: field.options || []
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }
    } else {
      const allFields = mockStore.getFields();
      if (field.id && !field.id.startsWith('temp-')) {
        const index = allFields.findIndex(f => f.id === field.id);
        if (index === -1) throw new Error('Field not found');
        const updated: ReportField = {
          ...allFields[index],
          ...field,
          updated_at: new Date().toISOString()
        } as ReportField;
        allFields[index] = updated;
        mockStore.saveFields(allFields);
        return updated;
      } else {
        const newField: ReportField = {
          id: 'f-' + Date.now(),
          template_id: field.template_id!,
          field_name: field.field_name || `field_${Date.now()}`,
          field_label: field.field_label || 'حقل جديد',
          field_type: field.field_type || 'textarea',
          placeholder: field.placeholder || '',
          required: field.required ?? false,
          sort_order: field.sort_order ?? (allFields.length + 1),
          options: field.options || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        allFields.push(newField);
        mockStore.saveFields(allFields);
        return newField;
      }
    }
  },

  /**
   * Delete a field
   */
  async deleteField(fieldId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('report_fields').delete().eq('id', fieldId);
      if (error) throw new Error(error.message);
    } else {
      const allFields = mockStore.getFields();
      const filtered = allFields.filter(f => f.id !== fieldId);
      mockStore.saveFields(filtered);
    }
  }
};
