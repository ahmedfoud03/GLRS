import { supabase, isSupabaseConfigured, mockStore } from '../lib/supabase';
import { 
  DailyReport, 
  ReportAnswer, 
  DailyReportFilter, 
  UnsubmittedUnitInfo, 
  AdminStatsSummary,
  Attachment,
  ReportingUnit,
  Profile
} from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { auditService } from './auditService';

export const reportService = {
  /**
   * Get report for a specific unit and date
   */
  async getUnitReportByDate(unitId: string, dateStr: string = getTodayDateString()): Promise<DailyReport | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('daily_reports')
        .select(`
          *,
          user:profiles(*),
          reporting_unit:reporting_units(*),
          template:report_templates(*, fields:report_fields(*)),
          answers:report_answers(*, field:report_fields(*)),
          attachments:attachments(*, uploader:profiles(*)),
          reviews:report_reviews(*, reviewer:profiles(*))
        `)
        .eq('reporting_unit_id', unitId)
        .eq('report_date', dateStr)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (data && data.template?.fields) {
        data.template.fields.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }
      return data;
    } else {
      const reports = mockStore.getReports();
      const r = reports.find(item => item.reporting_unit_id === unitId && item.report_date === dateStr);
      if (!r) return null;
      return this.populateMockReport(r);
    }
  },

  /**
   * Get full report details by ID
   */
  async getReportById(id: string): Promise<DailyReport | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('daily_reports')
        .select(`
          *,
          user:profiles(*),
          reporting_unit:reporting_units(*),
          template:report_templates(*, fields:report_fields(*)),
          answers:report_answers(*, field:report_fields(*)),
          attachments:attachments(*, uploader:profiles(*)),
          reviews:report_reviews(*, reviewer:profiles(*))
        `)
        .eq('id', id)
        .single();

      if (error) return null;
      if (data && data.template?.fields) {
        data.template.fields.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }
      return data;
    } else {
      const reports = mockStore.getReports();
      const r = reports.find(item => item.id === id);
      if (!r) return null;
      return this.populateMockReport(r);
    }
  },

  /**
   * Create or update draft / submitted report with answers
   */
  async saveReport(payload: {
    reportId?: string;
    userId: string;
    unitId: string;
    templateId: string;
    reportDate: string;
    answers: Record<string, any>;
    status: 'draft' | 'submitted';
    attachments?: Attachment[];
  }): Promise<DailyReport> {
    const { reportId, userId, unitId, templateId, reportDate, answers, status, attachments } = payload;
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      let activeReportId = reportId;

      // 1. Create or Update Daily Report Record
      if (!activeReportId) {
        // Check if report already exists for this unit & date
        const existing = await this.getUnitReportByDate(unitId, reportDate);
        if (existing) {
          activeReportId = existing.id;
          const { error } = await supabase
            .from('daily_reports')
            .update({
              status,
              submitted_at: status === 'submitted' ? now : existing.submitted_at,
              updated_at: now
            })
            .eq('id', activeReportId);
          if (error) throw new Error(error.message);
        } else {
          const { data: newRep, error: createErr } = await supabase
            .from('daily_reports')
            .insert({
              user_id: userId,
              reporting_unit_id: unitId,
              template_id: templateId,
              report_date: reportDate,
              status,
              submitted_at: status === 'submitted' ? now : null
            })
            .select()
            .single();
          if (createErr) throw new Error(createErr.message);
          activeReportId = newRep.id;
        }
      } else {
        const { error } = await supabase
          .from('daily_reports')
          .update({
            status,
            submitted_at: status === 'submitted' ? now : undefined,
            updated_at: now
          })
          .eq('id', activeReportId);
        if (error) throw new Error(error.message);
      }

      // 2. Save Answers
      const answerEntries = Object.entries(answers).map(([fieldId, val]) => ({
        report_id: activeReportId!,
        field_id: fieldId,
        value: typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')
      }));

      if (answerEntries.length > 0) {
        const { error: ansErr } = await supabase
          .from('report_answers')
          .upsert(answerEntries, { onConflict: 'report_id,field_id' });
        if (ansErr) throw new Error(ansErr.message);
      }

      // 3. Associate Attachments
      if (attachments && attachments.length > 0 && activeReportId) {
        const attIds = attachments.map(a => a.id);
        const { error: attErr } = await supabase
          .from('attachments')
          .update({ report_id: activeReportId })
          .in('id', attIds);
        if (attErr) console.warn('Could not update attachment associations:', attErr.message);
      }

      // 4. Log Audit
      await auditService.log(
        status === 'submitted' ? 'SUBMIT_REPORT' : 'SAVE_DRAFT_REPORT',
        'daily_reports',
        activeReportId,
        { unitId, reportDate, status },
        userId
      );

      const fullReport = await this.getReportById(activeReportId!);
      return fullReport!;
    } else {
      // Mock mode
      const reports = mockStore.getReports();
      const allAnswers = mockStore.getAnswers();
      let activeReport: DailyReport;

      let foundIndex = reportId ? reports.findIndex(r => r.id === reportId) : -1;
      if (foundIndex === -1) {
        foundIndex = reports.findIndex(r => r.reporting_unit_id === unitId && r.report_date === reportDate);
      }

      if (foundIndex !== -1) {
        reports[foundIndex] = {
          ...reports[foundIndex],
          status,
          submitted_at: status === 'submitted' ? now : reports[foundIndex].submitted_at,
          updated_at: now
        };
        activeReport = reports[foundIndex];
      } else {
        activeReport = {
          id: 'rep-' + Date.now(),
          user_id: userId,
          reporting_unit_id: unitId,
          template_id: templateId,
          report_date: reportDate,
          status,
          submitted_at: status === 'submitted' ? now : null,
          closed_at: null,
          created_at: now,
          updated_at: now
        };
        reports.push(activeReport);
      }
      mockStore.saveReports(reports);

      // Save Answers
      const remainingAnswers = allAnswers.filter(a => a.report_id !== activeReport.id);
      Object.entries(answers).forEach(([fieldId, val]) => {
        remainingAnswers.push({
          id: `ans-${activeReport.id}-${fieldId}`,
          report_id: activeReport.id,
          field_id: fieldId,
          value: val,
          created_at: now,
          updated_at: now
        });
      });
      mockStore.saveAnswers(remainingAnswers);

      // Associate Attachments
      if (attachments && attachments.length > 0) {
        const allAtts = mockStore.getAttachments();
        const attIds = new Set(attachments.map(a => a.id));
        const updatedAtts = allAtts.map(a => {
          if (attIds.has(a.id)) {
            return { ...a, report_id: activeReport.id };
          }
          return a;
        });
        mockStore.saveAttachments(updatedAtts);
      }

      await auditService.log(
        status === 'submitted' ? 'SUBMIT_REPORT' : 'SAVE_DRAFT_REPORT',
        'daily_reports',
        activeReport.id,
        { unitId, reportDate, status },
        userId
      );

      return this.populateMockReport(activeReport);
    }
  },

  /**
   * Return report with admin review note
   */
  async returnReport(reportId: string, reviewerId: string, comment: string): Promise<DailyReport> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      // 1. Update status
      const { error: repErr } = await supabase
        .from('daily_reports')
        .update({ status: 'returned', updated_at: now })
        .eq('id', reportId);
      if (repErr) throw new Error(repErr.message);

      // 2. Insert Review Record
      const { error: revErr } = await supabase
        .from('report_reviews')
        .insert({
          report_id: reportId,
          reviewer_id: reviewerId,
          action: 'returned',
          comment
        });
      if (revErr) throw new Error(revErr.message);

      await auditService.log('RETURN_REPORT', 'daily_reports', reportId, { comment }, reviewerId);
      const updated = await this.getReportById(reportId);
      return updated!;
    } else {
      const reports = mockStore.getReports();
      const reviews = mockStore.getReviews();
      const idx = reports.findIndex(r => r.id === reportId);
      if (idx === -1) throw new Error('Report not found');

      reports[idx].status = 'returned';
      reports[idx].updated_at = now;
      mockStore.saveReports(reports);

      const newReview = {
        id: 'rev-' + Date.now(),
        report_id: reportId,
        reviewer_id: reviewerId,
        action: 'returned' as const,
        comment,
        created_at: now
      };
      reviews.push(newReview);
      mockStore.saveReviews(reviews);

      await auditService.log('RETURN_REPORT', 'daily_reports', reportId, { comment }, reviewerId);
      return this.populateMockReport(reports[idx]);
    }
  },

  /**
   * Close & approve report
   */
  async closeReport(reportId: string, reviewerId: string, comment?: string): Promise<DailyReport> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { error: repErr } = await supabase
        .from('daily_reports')
        .update({ status: 'closed', closed_at: now, updated_at: now })
        .eq('id', reportId);
      if (repErr) throw new Error(repErr.message);

      if (comment) {
        await supabase.from('report_reviews').insert({
          report_id: reportId,
          reviewer_id: reviewerId,
          action: 'closed',
          comment
        });
      }

      await auditService.log('CLOSE_REPORT', 'daily_reports', reportId, { comment }, reviewerId);
      const updated = await this.getReportById(reportId);
      return updated!;
    } else {
      const reports = mockStore.getReports();
      const reviews = mockStore.getReviews();
      const idx = reports.findIndex(r => r.id === reportId);
      if (idx === -1) throw new Error('Report not found');

      reports[idx].status = 'closed';
      reports[idx].closed_at = now;
      reports[idx].updated_at = now;
      mockStore.saveReports(reports);

      if (comment) {
        reviews.push({
          id: 'rev-' + Date.now(),
          report_id: reportId,
          reviewer_id: reviewerId,
          action: 'closed' as const,
          comment,
          created_at: now
        });
        mockStore.saveReviews(reviews);
      }

      await auditService.log('CLOSE_REPORT', 'daily_reports', reportId, { comment }, reviewerId);
      return this.populateMockReport(reports[idx]);
    }
  },

  /**
   * Get reports with filter options
   */
  async getReports(filter: DailyReportFilter = {}): Promise<DailyReport[]> {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('daily_reports')
        .select(`
          *,
          user:profiles(*),
          reporting_unit:reporting_units(*),
          template:report_templates(name),
          reviews:report_reviews(*)
        `)
        .order('report_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (filter.date) {
        query = query.eq('report_date', filter.date);
      }
      if (filter.unitId) {
        query = query.eq('reporting_unit_id', filter.unitId);
      }
      if (filter.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      let reports = mockStore.getReports();

      if (filter.date) {
        reports = reports.filter(r => r.report_date === filter.date);
      }
      if (filter.unitId) {
        reports = reports.filter(r => r.reporting_unit_id === filter.unitId);
      }
      if (filter.status && filter.status !== 'all') {
        reports = reports.filter(r => r.status === filter.status);
      }

      return reports
        .map(r => this.populateMockReport(r))
        .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());
    }
  },

  /**
   * Track unsubmitted and submitted units for a specific date
   */
  async getUnsubmittedTracker(dateStr: string = getTodayDateString()): Promise<UnsubmittedUnitInfo[]> {
    let activeUnits: ReportingUnit[] = [];
    let profiles: Profile[] = [];

    if (isSupabaseConfigured()) {
      const [unitsRes, profilesRes] = await Promise.all([
        supabase.from('reporting_units').select('*').eq('active', true).order('name'),
        supabase.from('profiles').select('*').eq('active', true)
      ]);
      activeUnits = unitsRes.data || [];
      profiles = profilesRes.data || [];
    } else {
      const units = mockStore.getUnits ? mockStore.getUnits() : [];
      activeUnits = units.filter(u => u.active);
      profiles = mockStore.getProfiles ? mockStore.getProfiles() : [];
    }

    const reports = await this.getReports({ date: dateStr });

    return activeUnits.map(unit => {
      const report = reports.find(r => r.reporting_unit_id === unit.id);
      const assignedUsers = profiles.filter(p => p.reporting_unit_id === unit.id && p.active);

      let status: 'submitted' | 'draft' | 'returned' | 'closed' | 'unsubmitted' = 'unsubmitted';
      if (report) {
        status = report.status;
      }

      return {
        unit,
        hasSubmitted: Boolean(report && (report.status === 'submitted' || report.status === 'closed')),
        report: report || null,
        assignedUsers,
        status
      };
    });
  },

  /**
   * Calculate daily admin statistics
   */
  async getAdminDailyStats(dateStr: string = getTodayDateString()): Promise<AdminStatsSummary> {
    const tracker = await this.getUnsubmittedTracker(dateStr);
    const totalActiveUnits = tracker.length;
    const totalSubmittedToday = tracker.filter(t => t.status === 'submitted' || t.status === 'closed').length;
    const totalUnsubmittedToday = tracker.filter(t => t.status === 'unsubmitted' || t.status === 'draft').length;
    const totalReturnedToday = tracker.filter(t => t.status === 'returned').length;
    const totalClosedToday = tracker.filter(t => t.status === 'closed').length;
    const totalDraftsToday = tracker.filter(t => t.status === 'draft').length;

    const submissionRate = totalActiveUnits > 0 ? Math.round((totalSubmittedToday / totalActiveUnits) * 100) : 0;

    return {
      totalActiveUnits,
      totalSubmittedToday,
      totalUnsubmittedToday,
      totalReturnedToday,
      totalClosedToday,
      totalDraftsToday,
      submissionRate
    };
  },

  /**
   * Helper to populate relationships for mock reports
   */
  populateMockReport(r: DailyReport): DailyReport {
    const profiles = mockStore.getProfiles();
    const units = mockStore.getUnits();
    const templates = mockStore.getTemplates();
    const allFields = mockStore.getFields();
    const allAnswers = mockStore.getAnswers();
    const allReviews = mockStore.getReviews();
    const allAttachments = mockStore.getAttachments();

    const template = templates.find(t => t.id === r.template_id);
    const fields = allFields.filter(f => f.template_id === r.template_id).sort((a, b) => a.sort_order - b.sort_order);

    const answers = allAnswers
      .filter(a => a.report_id === r.id)
      .map(a => ({
        ...a,
        field: allFields.find(f => f.id === a.field_id)
      }));

    const reviews = allReviews
      .filter(rev => rev.report_id === r.id)
      .map(rev => ({
        ...rev,
        reviewer: profiles.find(p => p.id === rev.reviewer_id)
      }));

    const attachments = allAttachments
      .filter(att => att.report_id === r.id)
      .map(att => ({
        ...att,
        uploader: profiles.find(p => p.id === att.uploaded_by)
      }));

    return {
      ...r,
      user: profiles.find(p => p.id === r.user_id),
      reporting_unit: units.find(u => u.id === r.reporting_unit_id),
      template: template ? { ...template, fields } : undefined,
      answers,
      reviews,
      attachments
    };
  }
};
