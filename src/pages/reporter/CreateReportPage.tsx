import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from '../../contexts/RouterContext';
import { reportService } from '../../services/reportService';
import { templateService } from '../../services/templateService';
import { unitService } from '../../services/unitService';
import { DailyReport, ReportTemplate, ReportingUnit, Attachment } from '../../types';
import { DynamicReportForm } from '../../components/reports/DynamicReportForm';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';
import { getTodayDateString, formatArabicDate } from '../../utils/dateUtils';
import { ArrowRight, FilePlus, AlertCircle, Building2, Layers, HelpCircle, Laptop, Megaphone } from 'lucide-react';
import { Link } from '../../components/common/Link';

const IT_UNIT_ID = '88888888-8888-8888-8888-888888888888';
const MKT_UNIT_ID = '10101010-1010-1010-1010-101010101010';

export const CreateReportPage: React.FC = () => {
  const { user, isHospitalDirector, isSuperAdmin } = useAuth();
  const { navigate, goBack } = useRouter();
  const { success, error: toastError } = useToast();

  const [availableUnits, setAvailableUnits] = useState<ReportingUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  const [existingReport, setExistingReport] = useState<DailyReport | null>(null);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const todayStr = getTodayDateString();

  // Initialize available units and default selection
  useEffect(() => {
    const initUnits = async () => {
      try {
        setUnitsLoading(true);
        const units = await unitService.getUnits();
        setAvailableUnits(units);

        if (isSuperAdmin) {
          const defaultUnit = units.find(u => u.id === IT_UNIT_ID) || units.find(u => u.id === MKT_UNIT_ID) || user?.profile?.reporting_unit;
          setSelectedUnitId(defaultUnit?.id || IT_UNIT_ID);
        } else {
          setSelectedUnitId(user?.profile?.reporting_unit_id || '');
        }
      } catch (err) {
        console.error('Failed to init units:', err);
      } finally {
        setUnitsLoading(false);
      }
    };

    initUnits();
  }, [user, isSuperAdmin]);

  const activeUnit = availableUnits.find(u => u.id === selectedUnitId) || user?.profile?.reporting_unit || null;

  useEffect(() => {
    const loadFormInfo = async () => {
      if (!user || isHospitalDirector) {
        setLoading(false);
        return;
      }

      if (!activeUnit?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Check if a report for today already exists
        const rep = await reportService.getUnitReportByDate(activeUnit.id, todayStr);
        setExistingReport(rep);

        // 2. Load template assigned to this unit, or fallback to default
        let tplId = activeUnit.report_template_id;
        if (!tplId) {
          const currentU = availableUnits.find((u) => u.id === activeUnit.id);
          tplId = currentU?.report_template_id || null;
        }

        let loadedTemplate: ReportTemplate | null = null;
        if (tplId) {
          loadedTemplate = await templateService.getTemplateById(tplId);
        }

        if (!loadedTemplate) {
          const templates = await templateService.getTemplates();
          loadedTemplate = templates.find((t) => t.is_default) || templates[0];
        }

        setTemplate(loadedTemplate);
      } catch (err: any) {
        toastError(err.message || 'فشل تحميل بيانات النموذج');
      } finally {
        setLoading(false);
      }
    };

    // Only run when units are done loading
    if (!unitsLoading) {
      if (activeUnit?.id) {
        loadFormInfo();
      } else if (!isHospitalDirector) {
        setLoading(false);
      }
    }
  }, [user, activeUnit?.id, todayStr, isHospitalDirector, unitsLoading]);

  const handleSaveDraft = async (answers: Record<string, any>, attachments: Attachment[]) => {
    if (!user || !activeUnit || !template) return;
    try {
      setActionLoading(true);
      const saved = await reportService.saveReport({
        reportId: existingReport?.id,
        userId: user.id,
        unitId: activeUnit.id,
        templateId: template.id,
        reportDate: todayStr,
        answers,
        status: 'draft',
        attachments
      });
      setExistingReport(saved);
      success('تم حفظ مسودة التقرير بنجاح. يمكنك استكمال تعبئته في أي وقت.');
    } catch (err: any) {
      toastError(err.message || 'فشل حفظ المسودة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReport = async (answers: Record<string, any>, attachments: Attachment[]) => {
    if (!user || !activeUnit || !template) return;
    try {
      setActionLoading(true);
      const saved = await reportService.saveReport({
        reportId: existingReport?.id,
        userId: user.id,
        unitId: activeUnit.id,
        templateId: template.id,
        reportDate: todayStr,
        answers,
        status: 'submitted',
        attachments
      });
      success(`تم رفع التقرير اليومي بنجاح (${activeUnit.name}) إلى إدارة المستشفى للمراجعة والاعتماد.`);
      navigate(`/reports/${saved.id}`);
    } catch (err: any) {
      toastError(err.message || 'فشل رفع التقرير');
    } finally {
      setActionLoading(false);
    }
  };

  // Hospital General Director Notice
  if (isHospitalDirector) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center text-right">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            صلاحيات مدير عام المستشفى
          </h3>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            بصفتك مديراً عاماً للمستشفى، تتركز مهامك على الإشراف والمتابعة الشاملة لجميع تقارير الأقسام والجهات والرقابة عليها، دون تكليف برفع تقارير فردية.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link to="/admin/reports" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" icon={<Layers className="w-4 h-4" />}>
                جميع تقارير المستشفى
              </Button>
            </Link>
            <Link to="/admin/unsubmitted" className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" icon={<HelpCircle className="w-4 h-4" />}>
                كشف من لم يرفع التقرير
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (unitsLoading || loading) {
    return <Spinner size="lg" text="جارٍ إعداد وتحميل نموذج التقرير اليومي..." />;
  }

  if (!activeUnit) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">
            لم يتم تحديد الجهة أو القسم
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            يرجى التأكد من تعيين القسم التابع لك لتتمكن من إنشاء التقارير.
          </p>
          <Button variant="secondary" size="sm" onClick={() => goBack('/dashboard')}>
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">لا يوجد نموذج تقرير مفعل</h3>
          <p className="text-xs text-slate-500 mb-6">
            لم يتم العثور على قالب تقرير مخصص لـ {activeUnit.name}. يرجى مراجعة إدارة النظام.
          </p>
          <Button variant="secondary" size="sm" onClick={() => goBack('/dashboard')}>
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-right max-w-4xl mx-auto">
      {/* Super Admin Unit Switcher Banner */}
      {isSuperAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-purple-700" />
              المسؤول التقني - تقارير قسمي تقنية المعلومات والتسويق
            </span>
            <p className="text-[11px] text-purple-700 mt-0.5">
              يمكنك رفع ومتابعة التقرير اليومي لقسم تقنية المعلومات أو قسم التسويق والإعلام:
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedUnitId(IT_UNIT_ID)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedUnitId === IT_UNIT_ID
                  ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-300'
                  : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100/70'
                }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>تقنية المعلومات</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedUnitId(MKT_UNIT_ID)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedUnitId === MKT_UNIT_ID
                  ? 'bg-purple-700 text-white shadow-sm ring-2 ring-purple-300'
                  : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100/70'
                }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>التسويق والإعلام</span>
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FilePlus className="w-6 h-6 text-emerald-600" />
            إنشاء التقرير اليومي - {activeUnit.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            تعبئة بيانات وإنجازات يوم {formatArabicDate(todayStr)} ({template.name})
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowRight className="w-4 h-4" />}
          onClick={() => goBack('/dashboard')}
        >
          رجوع للسابق
        </Button>
      </div>

      {/* Dynamic Form Engine */}
      <DynamicReportForm
        key={activeUnit.id}
        template={template}
        report={existingReport}
        reportDate={todayStr}
        userId={user!.id}
        unitId={activeUnit.id}
        unitName={activeUnit.name}
        onSaveDraft={handleSaveDraft}
        onSubmitReport={handleSubmitReport}
        loading={actionLoading}
      />
    </div>
  );
};
