import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { PortalLayout } from './PortalLayout';
import { motion } from 'motion/react';
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, Calendar, FileText, Award, TrendingUp, ClipboardList, CheckCircle, FileUp, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as examApi from '../api/examApi';

interface Exam {
  examId: number;
  examName: string;
  examTypeId: number;
  examTypeName: string;
  classId: number;
  className: string;
  academicYearId: string;
  academicYearName: string;
  startDate: string;
  endDate: string;
  venue: string;
  isActive: boolean;
}

interface Result {
  id: string;
  examId: string;
  examName: string;
  studentName: string;
  studentId: string;
  class: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

const statsCards = [
  { title: 'Total Exams', value: '48', icon: FileText, color: 'from-blue-500 to-blue-600', change: '+5' },
  { title: 'Upcoming Exams', value: '12', icon: Calendar, color: 'from-orange-500 to-orange-600', change: '+3' },
  { title: 'Completed Exams', value: '32', icon: CheckCircle, color: 'from-green-500 to-green-600', change: '+2' },
  { title: 'Avg Pass Rate', value: '87%', icon: Award, color: 'from-purple-500 to-purple-600', change: '+5%' },
];

const mockResults: Result[] = [
  {
    id: 'RES001',
    examId: 'EXM003',
    examName: 'Chemistry Final Exam',
    studentName: 'John Doe',
    studentId: 'STD001',
    class: 'Class 9-A',
    marksObtained: 85,
    totalMarks: 100,
    percentage: 85,
    grade: 'A',
    status: 'Pass',
  },
  {
    id: 'RES002',
    examId: 'EXM003',
    examName: 'Chemistry Final Exam',
    studentName: 'Jane Smith',
    studentId: 'STD002',
    class: 'Class 9-A',
    marksObtained: 92,
    totalMarks: 100,
    percentage: 92,
    grade: 'A+',
    status: 'Pass',
  },
  {
    id: 'RES003',
    examId: 'EXM003',
    examName: 'Chemistry Final Exam',
    studentName: 'Mike Johnson',
    studentId: 'STD003',
    class: 'Class 9-A',
    marksObtained: 45,
    totalMarks: 100,
    percentage: 45,
    grade: 'F',
    status: 'Fail',
  },
];

export function ExamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
  const [selectedType, setSelectedType] = useState('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [examTypeMap, setExamTypeMap] = useState<Record<string, string>>({});
  const [classMap, setClassMap] = useState<Record<string, string>>({});
  const [academicYearMap, setAcademicYearMap] = useState<Record<string, string>>({});
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showExportDropdown, setShowExportDropdown] = useState(false);


  const handleDownload = (format: 'pdf' | 'csv' | 'excel') => {
    toast.success(`Downloading report as ${format.toUpperCase()}...`, {
      description: `Your  report will be downloaded shortly.`,
    });
  };

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

  const getExamTypeDisplay = (exam: Exam) => exam.examTypeName?.trim() || examTypeMap[String(exam.examTypeId)] || '';
  const getClassDisplay = (exam: Exam) => exam.className?.trim() || classMap[String(exam.classId)] || '';
  const getAcademicYearDisplay = (exam: Exam) => exam.academicYearName?.trim() || academicYearMap[String(exam.academicYearId)] || '';

  useEffect(() => {
    let mounted = true;

    const loadExams = async () => {
      setIsLoadingExams(true);
      try {
        const [examsRes, examTypesRes, classesRes, academicYearsRes] = await Promise.allSettled([
          examApi.getAllExams(),
          examApi.getExamTypes(),
          examApi.getClasses(),
          examApi.getAcademicYears(),
        ]);

        const response = examsRes.status === 'fulfilled' ? examsRes.value : [];
        const responseData = toArray(response);

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

        const mappedExams: Exam[] = responseData.map((item: any) => ({
          examId: Number(item?.examId ?? 0),
          examName: String(item?.examName ?? ''),
          examTypeId: Number(item?.examTypeId ?? item?.examTypeID ?? item?.typeId ?? 0),
          examTypeName: String(item?.examTypeName ?? item?.examType ?? item?.typeName ?? ''),
          classId: Number(item?.classId ?? item?.classID ?? item?.stdClassId ?? 0),
          className: String(item?.className ?? item?.class ?? item?.classTitle ?? item?.classLabel ?? ''),
          academicYearId: String(item?.academicYearId ?? item?.yearId ?? item?.academicYrId ?? item?.acdYearId ?? item?.academicYearID ?? ''),
          academicYearName: String(
            item?.academicYearName ??
            item?.academicYear ??
            item?.yearName ??
            item?.year ??
            item?.yearLabel ??
            item?.session ??
            item?.academicYearTitle ??
            item?.academicYearLabel ??
            item?.acdYearName ??
            ''
          ),
          startDate: String(item?.startDate ?? ''),
          endDate: String(item?.endDate ?? ''),
          venue: String(item?.venue ?? ''),
          isActive: Boolean(item?.isActive),
        }));

        if (mounted) {
          setExams(mappedExams);
          
          const examTypeMap = toLookupMap(examTypeData, ['examTypeId', 'id', 'value'], ['examTypeName', 'name', 'label']);
          const classMap = toLookupMap(classData, ['classId', 'id', 'value'], ['className', 'name', 'label']);
          const academicYearMap = toLookupMap(
            academicYearData,
            ['academicYearId', 'yearId', 'id', 'value'],
            ['academicYearName', 'academicYear', 'yearName', 'name', 'label']
          );
          
          // Debug logging
          console.log('Academic Year Lookup Map:', academicYearMap);
          console.log('First 3 exams academicYearId:', mappedExams.slice(0, 3).map(e => ({ id: e.academicYearId, name: e.academicYearName })));
          
          setExamTypeMap(examTypeMap);
          setClassMap(classMap);
          setAcademicYearMap(academicYearMap);
        }
      } catch (error) {
        console.error('Failed to load exams', error);
        if (mounted) {
          setExams([]);
          toast.error('Failed to load exams list.');
        }
      } finally {
        if (mounted) {
          setIsLoadingExams(false);
        }
      }
    };

    loadExams();

    return () => {
      mounted = false;
    };
  }, []);

  const examTypes = [
    'All',
    ...Array.from(new Set(exams.map((exam) => getExamTypeDisplay(exam)).filter(Boolean))),
  ];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleDeleteExam = async (examId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this exam?');
    if (!confirmed) return;

    try {
      await examApi.deleteExam(examId);
      setExams((prev) => prev.filter((exam) => exam.examId !== examId));
      toast.success('Exam deleted successfully.');
    } catch (error) {
      console.error('Failed to delete exam', error);
      toast.error('Failed to delete exam.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      Ongoing: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      Completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
      Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Inactive: 'bg-red-500/10 text-red-500 border-red-500/20',
      Pass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Fail: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
      <Badge className={`${statusColors[status]} border`}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      'Mid-term': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      Final: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Unit Test': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      Practical: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    return (
      <Badge className={`${typeColors[type] || 'bg-slate-500/10 text-slate-600 border-slate-300'} border`}>
        {type}
      </Badge>
    );
  };

  const getGradeBadge = (grade: string) => {
    const gradeColors: Record<string, string> = {
      'A+': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      A: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      B: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      C: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      F: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
      <Badge className={`${gradeColors[grade] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'} border`}>
        {grade}
      </Badge>
    );
  };

  const filteredExams = exams.filter((exam) => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !normalizedSearchTerm ||
      [
        exam.examId,
        exam.examName,
        getExamTypeDisplay(exam),
        getClassDisplay(exam),
        getAcademicYearDisplay(exam),
        exam.venue,
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearchTerm));

    const matchesType =
      selectedType === 'all' ||
      getExamTypeDisplay(exam).toLowerCase() === selectedType;

    return matchesSearch && matchesType;
  });

  // Sort exams
  const sortedExams = [...filteredExams].sort((a, b) => {
    if (!sortField) return 0;
    let aValue = a[sortField as keyof Exam];
    let bValue = b[sortField as keyof Exam];
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Sort results
  const sortedResults = [...mockResults].sort((a, b) => {
    if (!sortField) return 0;
    let aValue = a[sortField as keyof Result];
    let bValue = b[sortField as keyof Result];
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPagesExams = Math.ceil(sortedExams.length / rowsPerPage);
  const paginatedExams = sortedExams.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPagesResults = Math.ceil(sortedResults.length / rowsPerPage);
  const paginatedResults = sortedResults.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const navigate = useNavigate();

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Exam Management"
      breadcrumbs={["Home", "Admin", "Exams"]}
    >
      <div className="min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Exam Management</h1>
              <p className="text-slate-600">Schedule and manage examinations</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="bg-gradient-to-r  from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 text-white transition-all duration-200"
                >
                  <FileDown className="w-4 h-4 " />
                  Export Data
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
                {showExportDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-lg rounded-lg z-50 min-w-[140px]"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleDownload('pdf');
                          setShowExportDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <FileDown className="w-4 h-4 mr-2 text-red-600" />
                        PDF
                      </button>
                      <button
                        onClick={() => {
                          handleDownload('csv');
                          setShowExportDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                        CSV
                      </button>
                      <button
                        onClick={() => {
                          handleDownload('excel');
                          setShowExportDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2 text-blue-600" />
                        Excel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              <Button
                onClick={() => navigate('/admin/schedule-exam')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule New Exam
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 sm:p-6 bg-gradient-to-br ${stat.color} text-white border-0 shadow-xl hover:shadow-2xl transition-shadow`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-white/80 text-xs">{stat.change}</span>
                </div>
                <h3 className="text-xl sm:text-2xl text-white">{stat.value}</h3>
                <p className="text-white/80 text-xs sm:text-sm mt-1">{stat.title}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-slate-200">
            <button
              onClick={() => { setActiveTab('exams'); setCurrentPage(1); setSortField(''); }}
              className={`pb-4 px-4 font-medium transition-all ${activeTab === 'exams'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              All Exams
            </button>
            <button
              onClick={() => { setActiveTab('results'); setCurrentPage(1); setSortField(''); }}
              className={`pb-4 px-4 font-medium transition-all ${activeTab === 'results'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              Exam Results
            </button>
          </div>
        </div>

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <>
            {/* Filters */}
            <Card className="bg-white border-slate-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by exam, class, year, venue..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {examTypes.map((type) => (
                    <option key={type} value={type.toLowerCase()}>
                      {type === 'All' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <Button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="bg-gradient-to-r h-[45px] from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 text-white transition-all duration-200"
                  >
                    <FileDown className="w-4 h-4 " />
                    Export Data
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                  {showExportDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-lg rounded-lg z-50 min-w-[140px]"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleDownload('pdf');
                            setShowExportDropdown(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <FileDown className="w-4 h-4 mr-2 text-red-600" />
                          PDF
                        </button>
                        <button
                          onClick={() => {
                            handleDownload('csv');
                            setShowExportDropdown(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                          CSV
                        </button>
                        <button
                          onClick={() => {
                            handleDownload('excel');
                            setShowExportDropdown(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2 text-blue-600" />
                          Excel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>

            {/* Exams Table */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200 flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-700 font-medium">Rows:</label>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="table-scroll">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('examId')}
                      >
                        <div className="flex items-center gap-2">
                          Exam ID
                          {sortField === 'examId' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('examName')}
                      >
                        <div className="flex items-center gap-2">
                          Exam Name
                          {sortField === 'examName' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('examTypeName')}
                      >
                        <div className="flex items-center gap-2">
                          Exam Type
                          {sortField === 'examTypeName' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('className')}
                      >
                        <div className="flex items-center gap-2">
                          Class
                          {sortField === 'className' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('academicYearName')}
                      >
                        <div className="flex items-center gap-2">
                          Academic Year
                          {sortField === 'academicYearName' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('startDate')}
                      >
                        <div className="flex items-center gap-2">
                          Start Date
                          {sortField === 'startDate' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('endDate')}
                      >
                        <div className="flex items-center gap-2">
                          End Date
                          {sortField === 'endDate' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('venue')}
                      >
                        <div className="flex items-center gap-2">
                          Venue
                          {sortField === 'venue' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('isActive')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {sortField === 'isActive' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {isLoadingExams ? (
                      <tr>
                        <td colSpan={10} className="py-6 px-6 text-center text-slate-500 text-sm">
                          Loading exams...
                        </td>
                      </tr>
                    ) : paginatedExams.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-6 px-6 text-center text-slate-500 text-sm">
                          No exams found.
                        </td>
                      </tr>
                    ) : paginatedExams.map((exam, index) => (
                      <motion.tr
                        key={exam.examId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="py-3 px-4 xl:px-6 text-slate-900 font-semibold text-sm">{exam.examId}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-900 font-semibold text-sm">{exam.examName || '-'}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{getExamTypeDisplay(exam)}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{getClassDisplay(exam)}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{getAcademicYearDisplay(exam)}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{exam.startDate || '-'}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{exam.endDate || '-'}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{exam.venue || '-'}</td>
                        <td className="py-3 px-4 xl:px-6">
                          {getStatusBadge(exam.isActive ? 'Active' : 'Inactive')}
                        </td>
                        <td className="py-3 px-4 xl:px-6">
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => navigate(`/admin/exams/${exam.examId}`)}
                              size="sm" 
                              variant="ghost" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => navigate(`/admin/exams/edit/${exam.examId}`)}
                              size="sm"
                              variant="ghost"
                              className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteExam(exam.examId)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200">
                <div className="text-xs sm:text-sm text-slate-600">
                  Showing <span className="text-slate-900 font-semibold">{paginatedExams.length}</span> of{' '}
                  <span className="text-slate-900 font-semibold">{sortedExams.length}</span> exams
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 text-sm px-3 sm:px-4"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPagesExams }, (_, index) => (
                    <Button
                      key={index + 1}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      className={`${currentPage === index + 1 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                        } text-sm px-3 sm:px-4`}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 text-sm px-3 sm:px-4"
                    disabled={currentPage === totalPagesExams}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <>
            {/* Filters */}
            <Card className="bg-white border-slate-200 p-6 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students, exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-2 border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="relative">
                  <Button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="bg-gradient-to-r h-[45px]  from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 text-white transition-all duration-200"
                  >
                    <FileDown className="w-4 h-4 " />
                    Export Result
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                  {showExportDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-lg rounded-lg z-50 min-w-[140px]"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleDownload('pdf');
                            setShowExportDropdown(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <FileDown className="w-4 h-4 mr-2 text-red-600" />
                          PDF
                        </button>
                        <button
                          onClick={() => {
                            handleDownload('csv');
                            setShowExportDropdown(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                          CSV
                        </button>
                        <button
                          onClick={() => {
                            handleDownload('excel');
                            setShowExportDropdown(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2 text-blue-600" />
                          Excel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>

            {/* Results Table */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200 flex justify-end items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-700 font-medium">Rows:</label>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="table-scroll">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('studentId')}
                      >
                        <div className="flex items-center gap-2">
                          Student ID
                          {sortField === 'studentId' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('studentName')}
                      >
                        <div className="flex items-center gap-2">
                          Student Name
                          {sortField === 'studentName' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('class')}
                      >
                        <div className="flex items-center gap-2">
                          Class
                          {sortField === 'class' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('examName')}
                      >
                        <div className="flex items-center gap-2">
                          Exam
                          {sortField === 'examName' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('marksObtained')}
                      >
                        <div className="flex items-center gap-2">
                          Marks Obtained
                          {sortField === 'marksObtained' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('totalMarks')}
                      >
                        <div className="flex items-center gap-2">
                          Total Marks
                          {sortField === 'totalMarks' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('percentage')}
                      >
                        <div className="flex items-center gap-2">
                          Percentage
                          {sortField === 'percentage' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('grade')}
                      >
                        <div className="flex items-center gap-2">
                          Grade
                          {sortField === 'grade' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          Status
                          {sortField === 'status' ? (
                            sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4 opacity-0" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {paginatedResults.map((result, index) => (
                      <motion.tr
                        key={result.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
                      >
                        <td className="py-3 px-4 xl:px-6 text-slate-900 font-semibold text-sm">{result.studentId}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-900 font-semibold text-sm">{result.studentName}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{result.class}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{result.examName}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{result.marksObtained}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{result.totalMarks}</td>
                        <td className="py-3 px-4 xl:px-6 text-slate-700 text-sm">{result.percentage}%</td>
                        <td className="py-3 px-4 xl:px-6">{getGradeBadge(result.grade)}</td>
                        <td className="py-3 px-4 xl:px-6">{getStatusBadge(result.status)}</td>
                        <td className="py-3 px-4 xl:px-6">
                          <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200">
                <div className="text-xs sm:text-sm text-slate-600">
                  Showing <span className="text-slate-900 font-semibold">{paginatedResults.length}</span> of{' '}
                  <span className="text-slate-900 font-semibold">{sortedResults.length}</span> results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 text-sm px-3 sm:px-4"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPagesResults }, (_, index) => (
                    <Button
                      key={index + 1}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      className={`${currentPage === index + 1 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                        } text-sm px-3 sm:px-4`}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 text-sm px-3 sm:px-4"
                    disabled={currentPage === totalPagesResults}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
}