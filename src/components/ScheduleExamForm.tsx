import { useEffect, useState } from 'react';
import { Save, RotateCcw, Plus, X, ArrowLeft } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PortalLayout } from './PortalLayout';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import axios from 'axios';
import * as examApi from '../api/examApi';

// ── Types ────────────────────────────────────────────────────────────────────
interface ExamSubject {
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: string;
}

// ── Constants ────────────────────────────────────────────────────────────────
// Note: backend endpoints wired via src/api/examApi.ts

const REQUIRED_FIELDS = [
  'examName', 'examType', 'class', 'academicYear', 'startDate', 'endDate', 'venue',
];

const INITIAL_FORM: Record<string, string> = {
  examName: '',
  examType: '',
  class: '',
  academicYear: '',
  startDate: '',
  endDate: '',
  venue: '',
  instructions: '',
};

const EMPTY_SUBJECT: ExamSubject = {
  subject: '', date: '', startTime: '', endTime: '', maxMarks: '',
};

// ── Validation ───────────────────────────────────────────────────────────────
function getFieldError(name: string, value: string, allValues: Record<string, string>): string | null {
  if (REQUIRED_FIELDS.includes(name) && !value.trim()) return 'This field is required.';

  if (name === 'endDate' && value && allValues.startDate) {
    if (new Date(value) < new Date(allValues.startDate))
      return 'End date cannot be before start date.';
  }

  return null;
}

function getSubjectError(field: keyof ExamSubject, value: string, subject: ExamSubject): string | null {
  const requiredSubjectFields: (keyof ExamSubject)[] = [
    'subject', 'date', 'startTime', 'endTime', 'maxMarks',
  ];

  if (requiredSubjectFields.includes(field) && !value.trim()) return 'Required.';

  if (field === 'endTime' && value && subject.startTime) {
    if (value <= subject.startTime) return 'End time must be after start time.';
  }

  if (field === 'maxMarks' && value) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return 'Must be greater than 0.';
  }

  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function inputCls(error: string | null) {
  return [
    'w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border rounded-lg text-slate-900',
    'placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-colors',
    error
      ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
      : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500',
  ].join(' ');
}

function subjectInputCls(error: string | null) {
  return [
    'w-full px-3 py-2 bg-white border rounded-lg text-slate-900',
    'placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-colors appearance-none cursor-pointer',
    error
      ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
      : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500',
  ].join(' ');
}

// ── Component ────────────────────────────────────────────────────────────────
export function ScheduleExamForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(INITIAL_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([{ ...EMPTY_SUBJECT }]);
  // touchedSubjects[i][field] = true when that cell has been blurred
  const [touchedSubjects, setTouchedSubjects] = useState<Record<string, boolean>[]>([{}]);

  // ── Derived errors ─────────────────────────────────────────────────────────
  const errors: Record<string, string | null> = {};
  for (const key of Object.keys(formData)) {
    errors[key] = touched[key] ? getFieldError(key, formData[key], formData) : null;
  }

  const subjectErrors: Record<string, string | null>[] = examSubjects.map((sub, i) => {
    const result: Record<string, string | null> = {};
    for (const field of Object.keys(EMPTY_SUBJECT) as (keyof ExamSubject)[]) {
      result[field] = touchedSubjects[i]?.[field]
        ? getSubjectError(field, sub[field], sub)
        : null;
    }
    return result;
  });

  const hasFormError = Object.keys(formData).some(
    (k) => getFieldError(k, formData[k], formData) !== null
  );

  const hasSubjectError = examSubjects.some((sub) =>
    (Object.keys(EMPTY_SUBJECT) as (keyof ExamSubject)[]).some(
      (f) => getSubjectError(f, sub[f], sub) !== null
    )
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubjectChange = (index: number, field: keyof ExamSubject, value: string) => {
    setExamSubjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubjectBlur = (index: number, field: keyof ExamSubject) => {
    setTouchedSubjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...(updated[index] || {}), [field]: true };
      return updated;
    });
  };

  const addSubject = () => {
    setExamSubjects((prev) => [...prev, { ...EMPTY_SUBJECT }]);
    setTouchedSubjects((prev) => [...prev, {}]);
  };

  const removeSubject = (index: number) => {
    setExamSubjects((prev) => prev.filter((_, i) => i !== index));
    setTouchedSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setTouched({});
    setExamSubjects([{ ...EMPTY_SUBJECT }]);
    setTouchedSubjects([{}]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all form fields as touched
    setTouched(Object.fromEntries(Object.keys(formData).map((k) => [k, true])));

    // Mark all subject fields as touched
    const allSubjectFields = Object.keys(EMPTY_SUBJECT);
    setTouchedSubjects(
      examSubjects.map(() => Object.fromEntries(allSubjectFields.map((f) => [f, true])))
    );

    if (hasFormError || hasSubjectError) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        examName: formData.examName,
        examTypeId: parseInt(formData.examType) || 0,
        classId: parseInt(formData.class) || 0,
        academicYearId: parseInt(formData.academicYear) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        venue: formData.venue,
        createdBy: 0,
        isActive: true,
        schedules: examSubjects.map((sub) => ({
          subjectId: parseInt(sub.subject) || 0,
          examDate: sub.date,
          startTime: sub.startTime,
          endTime: sub.endTime,
          maxMarks: parseInt(sub.maxMarks) || 0,
        })),
      };

      await examApi.createExamWithSchedule(payload);

      toast.success('Exam Scheduled Successfully!', {
        description: `${formData.examName} for Class ${formData.class} has been scheduled.`,
      });

      setTimeout(() => navigate('/admin/exams'), 1000);
    } catch (error) {
      toast.error('Failed to schedule exam', {
        description:
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Load master data (exam types, classes, academic years, subjects) ─────
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [yrs, cls, subs, types] = await Promise.all([
          examApi.getAcademicYears(),
          examApi.getClasses(),
          examApi.getSubjects(),
          examApi.getExamTypes(),
        ]);
        if (!mounted) return;
        setAcademicYears(Array.isArray(yrs) ? yrs : []);
        setClasses(Array.isArray(cls) ? cls : []);
        setSubjects(Array.isArray(subs) ? subs : []);
        setExamTypes(Array.isArray(types) ? types : []);
      } catch (err) {
        console.error('Failed to load master data', err);
        toast.error('Failed to load lookup data for exams.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Sub-components ─────────────────────────────────────────────────────────
  const fieldProps = (name: string) => ({
    name,
    value: formData[name],
    onChange: handleInputChange,
    onBlur: handleBlur,
    className: inputCls(errors[name]),
  });

  const ErrorMsg = ({ name }: { name: string }) =>
    errors[name] ? <p className="mt-1 text-xs text-red-500">{errors[name]}</p> : null;

  const SubjectErrorMsg = ({ index, field }: { index: number; field: keyof ExamSubject }) =>
    subjectErrors[index]?.[field] ? (
      <p className="mt-0.5 text-xs text-red-500">{subjectErrors[index][field]}</p>
    ) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Schedule New Exam"
      breadcrumbs={['Home', 'Admin', 'Exams', 'Schedule Exam']}
    >
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/exams')}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exams
        </Button>
        <Card className="bg-white border border-slate-200">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Exam Information</h2>
              <p className="text-sm text-slate-600 mt-1">Fill in the details to schedule a new examination</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Basic Information ──────────────────────────────────── */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Basic Information
                </h3>

                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Exam Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., First Terminal Examination"
                      {...fieldProps('examName')}
                    />
                    <ErrorMsg name="examName" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Exam Type <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('examType')}>
                      <option value="">Select Exam Type *</option>
                      {examTypes.map((t: any) => (
                        <option key={t.examTypeId ?? t.id ?? t.value} value={String(t.examTypeId ?? t.id ?? t.value)}>
                          {t.examTypeName ?? t.name ?? t.label}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="examType" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('class')}>
                      <option value="">Select Class *</option>
                      {classes.map((c: any) => (
                        <option key={c.classId ?? c.id} value={String(c.classId ?? c.id)}>
                          {c.className ?? c.name ?? `Class ${c.classId ?? c.id}`}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="class" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Academic Year <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('academicYear')}>
                      <option value="">Select Academic Year *</option>
                      {academicYears.map((y: any) => (
                        <option key={y.academicYearId ?? y.id} value={String(y.academicYearId ?? y.id)}>
                          {y.academicYearName ?? y.name ?? y.label}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="academicYear" />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input type="date" {...fieldProps('startDate')} />
                    <ErrorMsg name="startDate" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input type="date" {...fieldProps('endDate')} />
                    <ErrorMsg name="endDate" />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Main Examination Hall"
                    {...fieldProps('venue')}
                  />
                  <ErrorMsg name="venue" />
                </div>
              </div>

              {/* ── Subject Schedule ───────────────────────────────────── */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Subject Schedule
                </h3>

                <div className="space-y-4">
                  {examSubjects.map((subject, index) => (
                    <Card key={index} className="p-4 bg-slate-50 border border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-700">Subject {index + 1}</h4>
                        {examSubjects.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeSubject(index)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1 h-auto"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

                        {/* Subject */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={subject.subject}
                            onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                            onBlur={() => handleSubjectBlur(index, 'subject')}
                            className={subjectInputCls(subjectErrors[index]?.subject)}
                          >
                            <option value="">Select</option>
                            {subjects.map((s: any) => (
                              <option key={s.id ?? s.subjectId ?? s.subjectId} value={String(s.id ?? s.subjectId ?? s.subjectId)}>
                                {s.name ?? s.subjectName ?? s.name}
                              </option>
                            ))}
                          </select>
                          <SubjectErrorMsg index={index} field="subject" />
                        </div>

                        {/* Date */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={subject.date}
                            onChange={(e) => handleSubjectChange(index, 'date', e.target.value)}
                            onBlur={() => handleSubjectBlur(index, 'date')}
                            className={subjectInputCls(subjectErrors[index]?.date)}
                          />
                          <SubjectErrorMsg index={index} field="date" />
                        </div>

                        {/* Start Time */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Start Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={subject.startTime}
                            onChange={(e) => handleSubjectChange(index, 'startTime', e.target.value)}
                            onBlur={() => handleSubjectBlur(index, 'startTime')}
                            className={subjectInputCls(subjectErrors[index]?.startTime)}
                          />
                          <SubjectErrorMsg index={index} field="startTime" />
                        </div>

                        {/* End Time */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            End Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={subject.endTime}
                            onChange={(e) => handleSubjectChange(index, 'endTime', e.target.value)}
                            onBlur={() => handleSubjectBlur(index, 'endTime')}
                            className={subjectInputCls(subjectErrors[index]?.endTime)}
                          />
                          <SubjectErrorMsg index={index} field="endTime" />
                        </div>

                        {/* Max Marks */}
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Max Marks <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="100"
                            value={subject.maxMarks}
                            onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                            onBlur={() => handleSubjectBlur(index, 'maxMarks')}
                            className={subjectInputCls(subjectErrors[index]?.maxMarks)}
                          />
                          <SubjectErrorMsg index={index} field="maxMarks" />
                        </div>

                      </div>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    onClick={addSubject}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
              </div>

              {/* ── Instructions ───────────────────────────────────────── */}
              <div className="mb-6 sm:mb-8">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Exam Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  rows={4}
                  placeholder="Enter exam instructions and guidelines for students..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500  text-sm transition-colors"
                />
              </div>

              {/* ── Action Buttons ─────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Scheduling...' : 'Schedule Exam'}
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 text-slate-700 py-3 border-2 border-slate-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>
              </div>

            </form>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}