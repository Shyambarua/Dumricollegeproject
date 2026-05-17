import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Mail, Phone, User, BookOpen, GraduationCap, Calendar, Briefcase } from 'lucide-react';
import { PortalLayout } from './PortalLayout';
import { Card } from './ui/card';
import { Button } from './ui/button';

function getValue(source: any, keys: string[]) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
}

function formatLabel(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: any) {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join(', ');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function normalizeFieldKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function ViewTeacher() {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!teacherId) {
        setError('Teacher ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`https://localhost:44328/api/Teacher/${teacherId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch teacher details');
        }

        const data = await response.json();
        const teacherData = data?.data ?? data?.teacher ?? data;
        setTeacher(teacherData);
      } catch (err) {
        console.error('Error loading teacher details:', err);
        setError('Unable to load teacher details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const summary = useMemo(() => {
    if (!teacher) return null;

    const firstName = getValue(teacher, ['firstName', 'FirstName']);
    const lastName = getValue(teacher, ['lastName', 'LastName']);

    return {
      name:
        getValue(teacher, ['name', 'Name', 'teacherName', 'TeacherName', 'fullName', 'FullName']) ||
        [firstName, lastName].filter(Boolean).join(' ') ||
        'Teacher',
      email: getValue(teacher, ['email', 'Email', 'emailAddress', 'EmailAddress']),
      phone: getValue(teacher, ['phone', 'Phone', 'mobileNumber', 'MobileNumber', 'contactNumber', 'ContactNumber']),
      employeeId: getValue(teacher, ['employeeId', 'EmployeeId']),
      subject: getValue(teacher, ['subjectName', 'SubjectName', 'subject', 'Subject']),
      designation: getValue(teacher, ['designationName', 'DesignationName', 'designation', 'Designation']),
      department: getValue(teacher, ['departmentName', 'DepartmentName', 'department', 'Department']),
      qualification: getValue(teacher, ['qualificationName', 'QualificationName', 'qualification', 'Qualification']),
      experience: getValue(teacher, ['experience', 'Experience', 'yearsOfExperience', 'YearsOfExperience']),
      joiningDate: getValue(teacher, ['joiningDate', 'JoiningDate', 'dateOfJoining', 'DateOfJoining']),
      status: getValue(teacher, ['status', 'Status', 'teacherStatus', 'TeacherStatus']),
      address: getValue(teacher, ['address', 'Address', 'localAddress', 'LocalAddress', 'permanentAddress', 'PermanentAddress']),
    };
  }, [teacher]);

  const filteredEntries = useMemo(() => {
    if (!teacher || typeof teacher !== 'object') return [] as [string, any][];

    const duplicateKeys = new Set([
      'name',
      'teachername',
      'fullname',
      'firstname',
      'lastname',
      'email',
      'emailaddress',
      'phone',
      'mobilenumber',
      'contactnumber',
      'employeeid',
      'subject',
      'subjectname',
      'designation',
      'designationname',
      'department',
      'departmentname',
      'qualification',
      'qualificationname',
      'experience',
      'yearsofexperience',
      'joiningdate',
      'dateofjoining',
      'status',
      'teacherstatus',
      'address',
      'localaddress',
      'permanentaddress',
      'createdby',
      'createdbyuser',
      'createddate',
      'createdat',
      'createdbyid',
      'createduser',
    ]);

    return Object.entries(teacher).filter(([key]) => {
      const normalizedKey = normalizeFieldKey(key);

      // Remove main id field(s)
      if (normalizedKey === 'id' || normalizedKey === 'teacherid') return false;

      // Remove fields already displayed in summary cards
      if (duplicateKeys.has(normalizedKey)) return false;

      return true;
    });
  }, [teacher]);

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Teacher Details"
      breadcrumbs={['Home', 'Admin', 'Teachers', 'View Teacher']}
    >
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/teachers')}
          className="bg-white hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>

        {loading && (
          <Card className="p-8 text-slate-600">Loading teacher details...</Card>
        )}

        {!loading && error && (
          <Card className="p-8 text-red-600">{error}</Card>
        )}

        {!loading && !error && teacher && summary && (
          <>
            <Card className="bg-white border border-slate-200">
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                    <User className="w-7 h-7 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{formatValue(summary.name)}</h2>
                    <p className="text-slate-600">Employee ID: {formatValue(summary.employeeId)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2"><Mail className="w-3 h-3" /> Email</div>
                    <div className="text-slate-800 break-all">{formatValue(summary.email)}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</div>
                    <div className="text-slate-800">{formatValue(summary.phone)}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2"><BookOpen className="w-3 h-3" /> Subject</div>
                    <div className="text-slate-800">{formatValue(summary.subject)}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Designation</div>
                    <div className="text-slate-800">{formatValue(summary.designation)}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">Department</div>
                    <div className="text-slate-800">{formatValue(summary.department)}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2"><GraduationCap className="w-3 h-3" /> Qualification</div>
                    <div className="text-slate-800">{formatValue(summary.qualification)}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">Experience</div>
                    <div className="text-slate-800">{formatValue(summary.experience)}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> Joining Date</div>
                    <div className="text-slate-800">{formatValue(summary.joiningDate)}</div>
                  </div>
                  <div className="p-4 rounded-lg border bg-slate-50 md:col-span-2 lg:col-span-3">
                    <div className="text-xs text-slate-500 mb-1">Address</div>
                    <div className="text-slate-800">{formatValue(summary.address)}</div>
                  </div>

                  {filteredEntries.map(([key, value]) => (
                    <div key={`teacher-field-${key}`} className="p-4 rounded-lg border bg-slate-50">
                      <p className="text-xs font-medium text-slate-500 mb-1">{formatLabel(key)}</p>
                      <p className="text-sm text-slate-800 break-words whitespace-pre-wrap">{formatValue(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
