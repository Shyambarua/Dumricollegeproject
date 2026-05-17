import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  BookOpen,
  Award,
  Clock,
  Users,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { PortalLayout } from './PortalLayout';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { TablePagination } from './ui/table-pagination';
import { getClasses, getSubjects } from '../api/subjectApi';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  classes: string[];
  status: 'active' | 'inactive' | 'on-leave';
  avatar?: string;
  salary: string;
  employeeId: string;
}

function getTeacherField(teacher: any, keys: string[]) {
  for (const key of keys) {
    if (teacher?.[key] !== undefined && teacher?.[key] !== null && teacher?.[key] !== '') {
      return teacher[key];
    }
  }
  return '';
}

function normalizeTextValue(value: any) {
  if (value === undefined || value === null || value === '') return '';
  return String(value);
}

function joinNonEmpty(parts: any[]) {
  return parts.map(normalizeTextValue).filter(Boolean).join(' ').trim();
}

function buildClassLookup(classes: any[]): Record<string, string> {
  return classes.reduce((lookup, classItem) => {
    const id = normalizeTextValue(getTeacherField(classItem, ['id', 'Id', 'classId', 'ClassId']));
    const name = normalizeTextValue(getTeacherField(classItem, ['name', 'Name', 'className', 'ClassName']));

    if (id && name) {
      lookup[id] = name;
    }

    return lookup;
  }, {} as Record<string, string>);
}

function buildSubjectLookup(subjects: any[]): Record<string, string> {
  return subjects.reduce((lookup, subjectItem) => {
    const id = normalizeTextValue(getTeacherField(subjectItem, ['id', 'Id', 'subjectId', 'SubjectId']));
    const name = normalizeTextValue(getTeacherField(subjectItem, ['name', 'Name', 'subjectName', 'SubjectName']));

    if (id && name) {
      lookup[id] = name;
    }

    return lookup;
  }, {} as Record<string, string>);
}

function resolveClassLabel(value: any, classLookup: Record<string, string>) {
  const textValue = normalizeTextValue(value);
  if (!textValue) return '';

  if (classLookup[textValue]) {
    return classLookup[textValue];
  }

  return textValue;
}

function normalizeClassesValue(rawClasses: any, classLookup: Record<string, string> = {}): string[] {
  if (!rawClasses) return [];

  if (Array.isArray(rawClasses)) {
    return rawClasses
      .map((item) => {
        if (typeof item === 'string' || typeof item === 'number') return resolveClassLabel(item, classLookup);
        const className = normalizeTextValue(
          getTeacherField(item, [
            'id',
            'Id',
            'classId',
            'ClassId',
            'className',
            'ClassName',
            'class',
            'Class',
            'teacherClass',
            'TeacherClass',
            'teacherClassName',
            'TeacherClassName',
            'name',
            'Name',
            'title',
            'Title',
            'grade',
            'Grade',
            'section',
            'Section',
            'classTitle',
            'ClassTitle',
            'classTeacher',
            'ClassTeacher',
          ])
        );
        if (className) return resolveClassLabel(className, classLookup);
        return normalizeTextValue(
          getTeacherField(item, [
            'classSection',
            'ClassSection',
            'classLabel',
            'ClassLabel',
            'assignedClassName',
            'AssignedClassName',
            'classDisplayName',
            'ClassDisplayName',
          ])
        );
      })
      .filter(Boolean);
  }

  if (typeof rawClasses === 'string') {
    return rawClasses
      .split(',')
      .map((value) => resolveClassLabel(value.trim(), classLookup))
      .filter(Boolean);
  }

  if (typeof rawClasses === 'number') {
    return [resolveClassLabel(rawClasses, classLookup)].filter(Boolean);
  }

  if (typeof rawClasses === 'object') {
    const className = normalizeTextValue(
      getTeacherField(rawClasses, [
        'id',
        'Id',
        'classId',
        'ClassId',
        'className',
        'ClassName',
        'class',
        'Class',
        'teacherClass',
        'TeacherClass',
        'teacherClassName',
        'TeacherClassName',
        'assignedClass',
        'AssignedClass',
        'assignedClassName',
        'AssignedClassName',
      ])
    );
    const grade = normalizeTextValue(getTeacherField(rawClasses, ['grade', 'Grade']));
    const section = normalizeTextValue(getTeacherField(rawClasses, ['section', 'Section']));
    const subjectName = normalizeTextValue(getTeacherField(rawClasses, ['subjectName', 'SubjectName', 'subject', 'Subject']));

    const composed = joinNonEmpty([
      resolveClassLabel(className, classLookup),
      grade ? `Grade ${grade}` : '',
      section ? `Section ${section}` : '',
      subjectName,
    ]);
    return composed ? [composed] : [];
  }

  return [];
}

function resolveSubjectLabel(value: any, subjectLookup: Record<string, string>) {
  const textValue = normalizeTextValue(value);
  if (!textValue) return '';

  if (subjectLookup[textValue]) {
    return subjectLookup[textValue];
  }

  return textValue;
}

function normalizeExperienceValue(teacher: any): string {
  const rawExperience = getTeacherField(teacher, [
    'experience',
    'Experience',
    'experienceYear',
    'ExperienceYear',
    'experienceYears',
    'ExperienceYears',
    'experienceYears',
    'ExperienceYears',
    'yearsExperience',
    'YearsExperience',
    'yearsOfExperience',
    'YearsOfExperience',
    'totalExperience',
    'TotalExperience',
    'workExperience',
    'WorkExperience',
    'experienceInYears',
    'ExperienceInYears',
    'teachingExperience',
    'TeachingExperience',
    'teacherExperience',
    'TeacherExperience',
    'yearsWorked',
    'YearsWorked',
    'yearsTeaching',
    'YearsTeaching',
  ]);

  const nestedExperience =
    getTeacherField(teacher, ['experienceDetails', 'ExperienceDetails', 'profile', 'Profile', 'teacherProfile', 'TeacherProfile']) ||
    getTeacherField(teacher, ['experienceInfo', 'ExperienceInfo']);

  const nestedYears = nestedExperience
    ? getTeacherField(nestedExperience, [
        'years',
        'Years',
        'value',
        'Value',
        'totalYears',
        'TotalYears',
        'experienceYears',
        'ExperienceYears',
      ])
    : '';

  const experienceSource = rawExperience !== undefined && rawExperience !== null && rawExperience !== '' ? rawExperience : nestedYears;

  if (experienceSource === undefined || experienceSource === null || experienceSource === '') {
    const joiningDate = normalizeTextValue(getTeacherField(teacher, ['joiningDate', 'JoiningDate', 'dateOfJoining', 'DateOfJoining']));
    if (!joiningDate) return '';

    const parsedDate = new Date(joiningDate);
    if (Number.isNaN(parsedDate.getTime())) return '';

    const diffMs = Date.now() - parsedDate.getTime();
    const years = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
    const months = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44)) - years * 12);

    if (years > 0) {
      return years === 1 ? '1 year' : `${years} years`;
    }

    if (months > 0) {
      return months === 1 ? '1 month' : `${months} months`;
    }

    return 'Less than 1 year';
  }

  const experienceText = String(experienceSource).trim();
  if (!experienceText) return '';

  return /\byears?\b/i.test(experienceText) ? experienceText : `${experienceText} years`;
}

function normalizeStatusValue(teacher: any): Teacher['status'] {
  const rawStatus = normalizeTextValue(
    getTeacherField(teacher, [
      'status',
      'Status',
      'statusName',
      'StatusName',
      'teacherStatus',
      'TeacherStatus',
      'employmentStatus',
      'EmploymentStatus',
    ])
  ).toLowerCase();

  if (!rawStatus) {
    const isActive = teacher?.isActive ?? teacher?.IsActive;
    if (typeof isActive === 'boolean') return isActive ? 'active' : 'inactive';
  }

  if (rawStatus.includes('leave')) return 'on-leave';
  if (rawStatus.includes('inactive') || rawStatus.includes('disabled')) return 'inactive';
  if (rawStatus.includes('active') || rawStatus.includes('enabled')) return 'active';

  return 'active';
}

function mapTeacherApiItem(teacher: any, classLookup: Record<string, string> = {}, subjectLookup: Record<string, string> = {}): Teacher {
  const firstName = normalizeTextValue(getTeacherField(teacher, ['firstName', 'FirstName', 'givenName', 'GivenName']));
  const lastName = normalizeTextValue(getTeacherField(teacher, ['lastName', 'LastName', 'surname', 'Surname', 'familyName', 'FamilyName']));
  const title = normalizeTextValue(getTeacherField(teacher, ['title', 'Title', 'prefix', 'Prefix', 'salutation', 'Salutation']));
  const fullName = normalizeTextValue(
    getTeacherField(teacher, [
      'name',
      'Name',
      'teacherName',
      'TeacherName',
      'fullName',
      'FullName',
      'teacherFullName',
      'TeacherFullName',
      'displayName',
      'DisplayName',
      'employeeName',
      'EmployeeName',
      'teacherFullname',
      'TeacherFullname',
    ])
  ) || joinNonEmpty([title, firstName, lastName]);

  const rawClasses = getTeacherField(teacher, [
    'classes',
    'Classes',
    'class',
    'Class',
    'className',
    'ClassName',
    'classNames',
    'ClassNames',
    'assignedClass',
    'AssignedClass',
    'assignedClassName',
    'AssignedClassName',
    'teacherClass',
    'TeacherClass',
    'teacherClassName',
    'TeacherClassName',
    'classTeacher',
    'ClassTeacher',
    'classTeacherName',
    'ClassTeacherName',
    'classNames',
    'ClassNames',
    'assignedClasses',
    'AssignedClasses',
    'teacherClasses',
    'TeacherClasses',
    'classList',
    'ClassList',
    'classAssignments',
    'ClassAssignments',
    'assignedClassList',
    'AssignedClassList',
  ]);
  const classes = normalizeClassesValue(rawClasses, classLookup);
  const classField = normalizeTextValue(
    getTeacherField(teacher, [
      'class',
      'Class',
      'className',
      'ClassName',
      'classTitle',
      'ClassTitle',
      'assignedClass',
      'AssignedClass',
      'teacherClass',
      'TeacherClass',
      'classTeacher',
      'ClassTeacher',
    ])
  );

  const directEmail = normalizeTextValue(
    getTeacherField(teacher, ['email', 'Email', 'emailAddress', 'EmailAddress', 'contactEmail', 'ContactEmail'])
  );
  const directPhone = normalizeTextValue(
    getTeacherField(teacher, ['phone', 'Phone', 'phoneNumber', 'PhoneNumber', 'mobile', 'Mobile', 'mobileNumber', 'MobileNumber', 'contactNumber', 'ContactNumber'])
  );

  const contactObject = getTeacherField(teacher, ['contact', 'Contact']);
  const contactEmail = directEmail || normalizeTextValue(getTeacherField(contactObject, ['email', 'Email', 'emailAddress', 'EmailAddress']));
  const contactPhone = directPhone || normalizeTextValue(getTeacherField(contactObject, ['phone', 'Phone', 'phoneNumber', 'PhoneNumber', 'mobile', 'Mobile', 'mobileNumber', 'MobileNumber']));
  const rawSubject = getTeacherField(teacher, [
    'subject',
    'Subject',
    'subjectName',
    'SubjectName',
    'subjectTitle',
    'SubjectTitle',
    'subjectId',
    'SubjectId',
    'teacherSubject',
    'TeacherSubject',
    'teacherSubjectName',
    'TeacherSubjectName',
  ]);
  const subject = resolveSubjectLabel(rawSubject, subjectLookup) || String(getTeacherField(teacher, ['subjectName', 'SubjectName', 'subject', 'Subject']));

  return {
    id: String(getTeacherField(teacher, ['id', 'Id', 'teacherId', 'TeacherId']) || crypto.randomUUID()),
    name: fullName || joinNonEmpty([firstName, lastName]) || String(getTeacherField(teacher, ['employeeId', 'EmployeeId'])) || 'Unnamed Teacher',
    email: contactEmail,
    phone: contactPhone,
    subject,
    qualification: String(getTeacherField(teacher, ['qualificationName', 'QualificationName', 'qualification', 'Qualification'])),
    experience: normalizeExperienceValue(teacher),
    joiningDate: String(getTeacherField(teacher, ['joiningDate', 'JoiningDate', 'dateOfJoining', 'DateOfJoining'])),
    classes: classes.length > 0 ? classes : classField ? [classField] : [],
    status: normalizeStatusValue(teacher),
    avatar: String(getTeacherField(teacher, ['avatar', 'Avatar'])) || undefined,
    salary: String(getTeacherField(teacher, ['salary', 'Salary'])),
    employeeId: String(getTeacherField(teacher, ['employeeId', 'EmployeeId'])),
  };
}

async function hydrateMissingTeacherFields(
  teacherItems: any[],
  classLookup: Record<string, string>,
  subjectLookup: Record<string, string>,
): Promise<Teacher[]> {
  const mappedTeachers = await Promise.all(
    teacherItems.map(async (item) => {
      const mappedTeacher = mapTeacherApiItem(item, classLookup, subjectLookup);

      if (mappedTeacher.subject && mappedTeacher.experience) {
        return mappedTeacher;
      }

      const teacherId = getTeacherField(item, ['id', 'Id', 'teacherId', 'TeacherId']);
      if (!teacherId) {
        return mappedTeacher;
      }

      try {
        const detailResponse = await fetch(`https://localhost:44328/api/Teacher/${teacherId}`);
        if (!detailResponse.ok) {
          return mappedTeacher;
        }

        const detailData = await detailResponse.json();
        const detailTeacher = Array.isArray(detailData) ? detailData[0] : (detailData?.data ?? detailData);
        const detailMapped = mapTeacherApiItem(detailTeacher ?? item, classLookup, subjectLookup);

        return {
          ...mappedTeacher,
          subject: mappedTeacher.subject || detailMapped.subject,
          experience: mappedTeacher.experience || detailMapped.experience,
        };
      } catch {
        return mappedTeacher;
      }
    })
  );

  return mappedTeachers;
}

export function TeacherManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const [teacherResponse, classList, subjectList] = await Promise.all([
          fetch('https://localhost:44328/api/Teacher/GetAllTeacher'),
          getClasses().catch(() => []),
          getSubjects().catch(() => []),
        ]);

        if (!teacherResponse.ok) {
          throw new Error('Failed to fetch teachers');
        }

        const data = await teacherResponse.json();
        const teacherList = Array.isArray(data) ? data : (data?.data ?? data?.teachers ?? []);
        const classLookup = buildClassLookup(classList);
        const subjectLookup = buildSubjectLookup(subjectList);
        setSubjectOptions(
          subjectList
            .map((subjectItem: any) => normalizeTextValue(getTeacherField(subjectItem, ['name', 'Name', 'subjectName', 'SubjectName'])))
            .filter(Boolean)
        );
        const hydratedTeachers = await hydrateMissingTeacherFields(teacherList, classLookup, subjectLookup);
        setTeachers(hydratedTeachers);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setTeachers([]);
        setSubjectOptions([]);
        toast.error('Failed to load teachers');
      }
    };

    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || teacher.subject === filterSubject;
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Apply sorting
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any = a[sortField as keyof Teacher];
    let bValue: any = b[sortField as keyof Teacher];

    // Handle string comparisons
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Apply pagination
  const paginatedTeachers = sortedTeachers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const resp = await fetch(`https://localhost:44328/api/Teacher/${id}`, {
        method: 'DELETE',
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        console.error('Delete failed:', resp.status, text);
        toast.error('Failed to delete teacher');
        return;
      }

      setTeachers((prev) => prev.filter((t) => t.id !== id));
      toast.success('Teacher deleted successfully!');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const stats = [
    {
      title: 'Total Teachers',
      value: teachers.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Active',
      value: teachers.filter((t) => t.status === 'active').length.toString(),
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'On Leave',
      value: teachers.filter((t) => t.status === 'on-leave').length.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'Subjects',
      value: new Set(teachers.map((t) => t.subject)).size.toString(),
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Teacher Management"
      breadcrumbs={["Home", "Admin", "Teachers"]}
    >
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => navigate('/admin/add-teacher')}
              className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg border-2 border-white/20"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Teacher
            </Button>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className={`p-6 border-2 ${stat.borderColor} ${stat.bgColor} shadow-lg h-full`}>
                  <div className="flex items-center justify-between h-full">
                    <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 mb-8 shadow-lg border-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-2 border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none"
                >
                  <option value="all">All Subjects</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Teachers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto table-scroll">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-100">
                    <th 
                      className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-slate-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-slate-200"
                      onClick={() => handleSort('employeeId')}
                    >
                      <div className="flex items-center gap-2">
                        Employee ID
                        {sortField === 'employeeId' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-slate-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-slate-200"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-slate-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-slate-200"
                      onClick={() => handleSort('subject')}
                    >
                      <div className="flex items-center gap-2">
                        Subject
                        {sortField === 'subject' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-slate-700 uppercase tracking-wide whitespace-nowrap">Contact</th>
                    <th 
                      className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-slate-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-slate-200"
                      onClick={() => handleSort('experience')}
                    >
                      <div className="flex items-center gap-2">
                        Experience
                        {sortField === 'experience' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-slate-700 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:bg-slate-200"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-semibold text-slate-700 uppercase tracking-wide whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedTeachers.map((teacher, index) => (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className={`border-b border-slate-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-blue-600">{teacher.employeeId}</span>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-slate-900">{teacher.name}</p>
                          <p className="text-sm text-slate-600">{teacher.qualification}</p>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                          {teacher.subject}
                        </Badge>
                      </td>
                      <td className="px-4 xl:px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {teacher.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4" />
                            {teacher.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                        {teacher.experience || '—'}
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(teacher.status)} border capitalize`}>
                          {teacher.status || 'active'}
                        </Badge>
                      </td>
                      <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/teacher-details/${teacher.id}`)}
                            className="hover:bg-amber-50 hover:text-amber-700 text-slate-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/edit-teacher/${teacher.id}`)}
                            className="hover:bg-amber-50 hover:text-amber-700 text-slate-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="hover:bg-red-50 hover:text-red-600"
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

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No teachers found</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Pagination */}
        <TablePagination
          totalItems={filteredTeachers.length}
          itemsPerPage={rowsPerPage}
          totalPages={Math.max(1, Math.ceil(filteredTeachers.length / rowsPerPage))}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </PortalLayout>
  );
}
