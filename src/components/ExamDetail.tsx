import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { PortalLayout } from './PortalLayout';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, FileText, Award, Clock, MapPin, Loader } from 'lucide-react';
import { toast } from 'sonner';
import * as examApi from '../api/examApi';

interface ExamDetails {
  examId: number;
  examName: string;
  examTypeId: number;
  examTypeName: string;
  classId: number;
  className: string;
  academicYearId: number;
  academicYearName: string;
  startDate: string;
  endDate: string;
  venue: string;
  isActive: boolean;
  schedules?: Array<{
    subjectId?: number;
    subjectName?: string;
    examDate?: string;
    startTime?: string;
    endTime?: string;
    maxMarks?: number;
    isActive?: boolean;
  }>;
}

interface ExamSubjectSchedule {
  examSubjectScheduleId?: number;
  examId?: number;
  subjectId?: number;
  subjectName?: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  maxMarks?: number;
}

export function ExamDetail() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [examTypeMap, setExamTypeMap] = useState<Record<string, string>>({});
  const [classMap, setClassMap] = useState<Record<string, string>>({});
  const [academicYearMap, setAcademicYearMap] = useState<Record<string, string>>({});

  const toLookupMap = (
    items: any[],
    idKeys: string[],
    nameKeys: string[],
  ): Record<string, string> => {
    return items.reduce((acc: Record<string, string>, item: any) => {
      const idKey = idKeys.find((k) => item?.[k] !== undefined && item?.[k] !== null && String(item?.[k]).trim() !== '');
      const nameKey = nameKeys.find((k) => item?.[k] !== undefined && item?.[k] !== null && String(item?.[k]).trim() !== '');

      if (!idKey || !nameKey) return acc;

      const rawId = String(item[idKey]).trim();
      const name = String(item[nameKey] ?? '').trim();

      if (rawId && name) {
        acc[rawId] = name;
      }

      return acc;
    }, {});
  };

  const toArray = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const normalizeTime = (value: string) => {
    if (!value) return '';
    const parts = value.split(':');
    if (parts.length >= 2) {
      const hours = Number(parts[0]);
      const minutes = parts[1];
      if (!Number.isNaN(hours)) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours % 12 === 0 ? 12 : hours % 12;
        return `${displayHour.toString().padStart(2, '0')}:${minutes} ${period}`;
      }
    }
    return value;
  };

  const getAcademicYearNameFromList = (academicYearId: string | number, examStartDate: string) => {
    const yearFromId = academicYearMap[String(academicYearId ?? '')];
    if (yearFromId?.trim()) return yearFromId;

    if (!academicYears.length || !examStartDate) return '';

    const startDate = new Date(examStartDate);
    if (Number.isNaN(startDate.getTime())) return '';

    const startYear = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const inferredAcademicYear = month >= 7 ? `${startYear}-${startYear + 1}` : `${startYear - 1}-${startYear}`;

    const matchedYear = academicYears.find((year: any) => {
      const yearName = String(year?.academicYearName ?? year?.academicYear ?? year?.yearName ?? year?.name ?? year?.label ?? '').trim();
      return yearName === inferredAcademicYear;
    });

    return String(
      matchedYear?.academicYearName ??
      matchedYear?.academicYear ??
      matchedYear?.yearName ??
      matchedYear?.name ??
      matchedYear?.label ??
      ''
    ).trim();
  };

  useEffect(() => {
    let mounted = true;

    const loadExamDetails = async () => {
      try {
        const [examRes, examTypesRes, classesRes, academicYearsRes, subjectSchedulesRes] = await Promise.allSettled([
          examApi.getAllExams(),
          examApi.getExamTypes(),
          examApi.getClasses(),
          examApi.getAcademicYears(),
          examApi.getAllSubjectByExamId(examId ?? ''),
        ]);

        // Load lookups
        const examTypeData =
          examTypesRes.status === 'fulfilled'
            ? toArray(examTypesRes.value)
            : [];

        const classData =
          classesRes.status === 'fulfilled'
            ? toArray(classesRes.value)
            : [];

        const academicYearData =
          academicYearsRes.status === 'fulfilled'
            ? toArray(academicYearsRes.value)
            : [];

        const subjectScheduleData =
          subjectSchedulesRes.status === 'fulfilled'
            ? toArray(subjectSchedulesRes.value)
            : [];

        const examTypeMap = toLookupMap(examTypeData, ['examTypeId', 'id', 'value'], ['examTypeName', 'name', 'label']);
        const classMap = toLookupMap(classData, ['classId', 'id', 'value'], ['className', 'name', 'label']);
        const academicYearMap = toLookupMap(
          academicYearData,
          ['academicYearId', 'yearId', 'id', 'value'],
          ['academicYearName', 'academicYear', 'yearName', 'name', 'label']
        );

        // Find the exam by ID
        const examsData = toArray(examRes.status === 'fulfilled' ? examRes.value : []);
        const foundExam = examsData.find((item: any) => Number(item?.examId) === Number(examId));

        if (!foundExam) {
          if (mounted) {
            toast.error('Exam not found.');
            navigate('/admin/exams');
          }
          return;
        }

        const mappedExam: ExamDetails = {
          examId: Number(foundExam?.examId ?? 0),
          examName: String(foundExam?.examName ?? ''),
          examTypeId: Number(foundExam?.examTypeId ?? foundExam?.examTypeID ?? foundExam?.typeId ?? 0),
          examTypeName: String(
            foundExam?.examTypeName ??
            foundExam?.examType ??
            foundExam?.typeName ??
            examTypeMap[String(foundExam?.examTypeId)] ??
            ''
          ),
          classId: Number(foundExam?.classId ?? foundExam?.classID ?? foundExam?.stdClassId ?? 0),
          className: String(
            foundExam?.className ??
            foundExam?.class ??
            foundExam?.classTitle ??
            foundExam?.classLabel ??
            classMap[String(foundExam?.classId)] ??
            ''
          ),
          academicYearId: Number(foundExam?.academicYearId ?? foundExam?.yearId ?? foundExam?.academicYrId ?? foundExam?.acdYearId ?? 0),
          academicYearName: String(
            foundExam?.academicYearName ??
            foundExam?.academicYear ??
            foundExam?.yearName ??
            foundExam?.year ??
            foundExam?.yearLabel ??
            foundExam?.session ??
            foundExam?.academicYearTitle ??
            foundExam?.academicYearLabel ??
            foundExam?.acdYearName ??
            academicYearMap[String(foundExam?.academicYearId)] ??
            ''
          ),
          startDate: String(foundExam?.startDate ?? ''),
          endDate: String(foundExam?.endDate ?? ''),
          venue: String(foundExam?.venue ?? ''),
          isActive: Boolean(foundExam?.isActive),
          schedules: subjectScheduleData.map((schedule: any) => ({
            examSubjectScheduleId: Number(schedule?.examSubjectScheduleId ?? 0),
            examId: Number(schedule?.examId ?? foundExam?.examId ?? 0),
            subjectId: Number(schedule?.subjectId ?? 0),
            subjectName: String(schedule?.subjectName ?? ''),
            examDate: String(schedule?.examDate ?? ''),
            startTime: String(schedule?.startTime ?? ''),
            endTime: String(schedule?.endTime ?? ''),
            maxMarks: Number(schedule?.maxMarks ?? 0),
          })),
        };

        if (mounted) {
          setExam(mappedExam);
          setExamTypeMap(examTypeMap);
          setClassMap(classMap);
          setAcademicYearMap(academicYearMap);
          setAcademicYears(academicYearData);
        }
      } catch (error) {
        console.error('Failed to load exam details', error);
        if (mounted) {
          toast.error('Failed to load exam details.');
          navigate('/admin/exams');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadExamDetails();

    return () => {
      mounted = false;
    };
  }, [examId, navigate]);

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={`${
        isActive
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          : 'bg-red-500/10 text-red-500 border-red-500/20'
      } border`}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getExamTypeDisplay = () =>
    exam?.examTypeName?.trim() || examTypeMap[String(exam?.examTypeId ?? '')] || '';

  const getClassDisplay = () =>
    exam?.className?.trim() || classMap[String(exam?.classId ?? '')] || '';

  const getAcademicYearDisplay = () =>
    exam?.academicYearName?.trim() ||
    getAcademicYearNameFromList(exam?.academicYearId ?? '', exam?.startDate ?? '');

  if (isLoading) {
    return (
      <PortalLayout
        role="admin"
        userName="Stevie Zone"
        userRole="Admin"
        pageTitle="Exam Details"
        breadcrumbs={["Home", "Admin", "Exams", "Details"]}
      >
        <div className="min-h-screen p-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-slate-600">Loading exam details...</span>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!exam) {
    return (
      <PortalLayout
        role="admin"
        userName="Stevie Zone"
        userRole="Admin"
        pageTitle="Exam Details"
        breadcrumbs={["Home", "Admin", "Exams", "Details"]}
      >
        <div className="min-h-screen p-6 flex items-center justify-center">
          <Card className="bg-white border-slate-200 p-6 max-w-md">
            <p className="text-slate-600">Exam not found.</p>
            <Button
              onClick={() => navigate('/admin/exams')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Exams
            </Button>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Exam Details"
      breadcrumbs={["Home", "Admin", "Exams", exam.examName]}
    >
      <div className="min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin/exams')}
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">{exam.examName}</h1>
                <p className="text-slate-600">Exam ID: {exam.examId}</p>
              </div>
            </div>
            <div>{getStatusBadge(exam.isActive)}</div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Exam Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Exam Type</p>
                  <p className="text-slate-900 font-medium">{getExamTypeDisplay() || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Class</p>
                  <p className="text-slate-900 font-medium">{getClassDisplay() || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Academic Year</p>
                  <p className="text-slate-900 font-medium">{getAcademicYearDisplay() || '-'}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Dates & Venue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Schedule & Venue
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Start Date</p>
                  <p className="text-slate-900 font-medium">{exam.startDate || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">End Date</p>
                  <p className="text-slate-900 font-medium">{exam.endDate || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Venue</p>
                  <p className="text-slate-900 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    {exam.venue || '-'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Full Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Complete Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Exam ID</p>
                <p className="text-slate-900 font-semibold text-lg">{exam.examId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Exam Type</p>
                <p className="text-slate-900 font-medium">{getExamTypeDisplay() || '-'}</p>
                <p className="text-xs text-slate-500 mt-1">ID: {exam.examTypeId || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Class</p>
                <p className="text-slate-900 font-medium">{getClassDisplay() || '-'}</p>
                <p className="text-xs text-slate-500 mt-1">ID: {exam.classId || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Academic Year</p>
                <p className="text-slate-900 font-medium">{getAcademicYearDisplay() || '-'}</p>
                <p className="text-xs text-slate-500 mt-1">ID: {exam.academicYearId || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Start Date</p>
                <p className="text-slate-900 font-medium">{exam.startDate || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">End Date</p>
                <p className="text-slate-900 font-medium">{exam.endDate || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Venue</p>
                <p className="text-slate-900 font-medium">{exam.venue || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Status</p>
                <p className="text-slate-900 font-medium">{exam.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Subject Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <Card className="bg-white border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Subject Schedule
            </h2>
            {exam.schedules && exam.schedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Exam Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Start Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">End Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {exam.schedules.map((schedule, index) => (
                      <tr key={`${schedule.subjectId ?? index}-${index}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{schedule.subjectName || schedule.subjectId || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{schedule.examDate || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{normalizeTime(schedule.startTime || '') || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{normalizeTime(schedule.endTime || '') || '-'}</td>
                        <td className="px-4 py-3 text-slate-700">{schedule.maxMarks ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No subject schedule data returned from the API for this exam.</p>
            )}
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex gap-3"
        >
          <Button
            onClick={() => navigate('/admin/exams')}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
