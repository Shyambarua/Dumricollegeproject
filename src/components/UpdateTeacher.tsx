import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Save, RotateCcw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PortalLayout } from './PortalLayout';
import { toast } from 'sonner';

const INITIAL_FORM: Record<string, string> = {
      employeeId: '', 
  firstName: '', lastName: '', gender: '', dateOfBirth: '',
  designation: '', department: '', qualification: '', experience: '',
  joiningDate: '', bloodGroup: '', religion: '', email: '', phone: '',
  address: '', city: '', state: '', zipCode: '', emergencyContact: '',
  salary: '', subjects: '', shortBio: '',
};

function getOptionId(item: any, preferredKeys: string[]) {
  for (const key of preferredKeys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return '';
}

function getOptionLabel(item: any, preferredKeys: string[]) {
  for (const key of preferredKeys) {
    if (item?.[key]) {
      return item[key];
    }
  }
  return '';
}

function inputCls(error: string | null) {
  return [
    'w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border rounded-lg text-slate-900',
    'placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-colors',
    error
      ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
      : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500',
  ].join(' ');
}

function pickFirst(obj: any, keys: string[]) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return '';
}

function resolveOptionValue(
  rawValue: any,
  options: any[],
  idKeys: string[],
  labelKeys: string[]
) {
  if (rawValue === undefined || rawValue === null || rawValue === '') return '';

  const normalizedRaw = String(rawValue).trim();
  const matchById = options.find((option) => {
    const optionId = pickFirst(option, idKeys);
    return optionId !== undefined && optionId !== null && String(optionId).trim() === normalizedRaw;
  });
  if (matchById) {
    return String(pickFirst(matchById, idKeys) || '');
  }

  const matchByLabel = options.find((option) => {
    const optionLabel = pickFirst(option, labelKeys);
    return optionLabel !== undefined && optionLabel !== null && String(optionLabel).trim() === normalizedRaw;
  });
  if (matchByLabel) {
    return String(pickFirst(matchByLabel, idKeys) || '');
  }

  return normalizedRaw;
}

export function UpdateTeacher() {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(INITIAL_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [genders, setGenders] = useState<any[]>([]);
  const [bloodGroups, setBloodGroups] = useState<any[]>([]);
  const [religions, setReligions] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [teachingSubjects, setTeachingSubjects] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    setBackendError(null);
  }, []);

  useEffect(() => {
    const fetchMaster = async (url: string, setter: (v: any[]) => void) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return setter([]);
        const data = await res.json();
        setter(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setter([]);
      }
    };

    fetchMaster('https://localhost:44328/api/Master/Genders', setGenders);
    fetchMaster('https://localhost:44328/api/Master/BloodGroup', setBloodGroups);
    fetchMaster('https://localhost:44328/api/Master/Religions', setReligions);
    fetchMaster('https://localhost:44328/api/Master/Designations', setDesignations);
    fetchMaster('https://localhost:44328/api/Master/Department', setDepartments);
    fetchMaster('https://localhost:44328/api/Master/Qualifications', setQualifications);
    fetchMaster('https://localhost:44328/api/Master/Subjects', setTeachingSubjects);
    fetchMaster('https://localhost:44328/api/Master/States', setStates);
  }, []);

  useEffect(() => {
    if (!teacherId) return;
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`https://localhost:44328/api/Teacher/${teacherId}`);
        if (!res.ok) throw new Error('Failed to fetch teacher');
        const data = await res.json();
        const teacher = data?.data ?? data ?? {};

        // Helper to extract id even when the API returns nested objects
        const extractIdOrValue = (value: any, idKeys: string[] = ['id', 'Id']) => {
          if (value === undefined || value === null) return '';
          if (typeof value === 'object') {
            return String(pickFirst(value, idKeys) || pickFirst(value, ['value', 'Value']) || '');
          }
          return String(value);
        };

        const employeeIdVal = String(
  pickFirst(teacher, ['employeeId', 'EmployeeId']) || ''
);

        const fullNameVal = String(pickFirst(teacher, ['name', 'Name', 'fullName', 'FullName', 'teacherName', 'TeacherName']) || '');
        const apiFirstName = String(pickFirst(teacher, ['firstName', 'FirstName', 'givenName', 'GivenName']) || '');
        const apiLastName = String(pickFirst(teacher, ['lastName', 'LastName', 'surname', 'Surname', 'familyName', 'FamilyName']) || '');
        const [splitFirstName, ...splitLastNameParts] = fullNameVal.trim().split(/\s+/).filter(Boolean);
        const firstNameVal = apiFirstName || splitFirstName || '';
        const lastNameVal = apiLastName || splitLastNameParts.join(' ') || '';

        const genderRaw = pickFirst(teacher, ['genderId', 'GenderId', 'gender', 'Gender']);
        const genderVal = extractIdOrValue(genderRaw, ['genderId', 'GenderId', 'id', 'Id']);

        const designationRaw = pickFirst(teacher, ['designationId', 'DesignationId', 'designation', 'Designation']);
        const designationVal = extractIdOrValue(designationRaw);

        const departmentRaw = pickFirst(teacher, ['departmentId', 'DepartmentId', 'department', 'Department']);
        const departmentVal = extractIdOrValue(departmentRaw);

        const qualificationRaw = pickFirst(teacher, ['qualificationId', 'QualificationId', 'qualification', 'Qualification']);
        const qualificationVal = extractIdOrValue(qualificationRaw);

        const bloodGroupRaw = pickFirst(teacher, ['bloodGroupId', 'BloodGroupId', 'bloodGroup', 'BloodGroup']);
        const bloodGroupVal = extractIdOrValue(bloodGroupRaw);

        const religionRaw = pickFirst(teacher, ['religionId', 'ReligionId', 'religion', 'Religion']);
        const religionVal = extractIdOrValue(religionRaw);

        const subjectRaw = pickFirst(teacher, ['subjectId', 'SubjectId', 'subjects', 'Subjects', 'subject', 'Subject']);
        const subjectVal = extractIdOrValue(subjectRaw);

        const stateRaw = pickFirst(teacher, ['stateId', 'StateId', 'state', 'State']);
        const stateVal = extractIdOrValue(stateRaw);

        const cityRaw = pickFirst(teacher, ['cityId', 'CityId', 'city', 'City']);
        const cityVal = extractIdOrValue(cityRaw);

        const mapped: Record<string, string> = {
            
          firstName: firstNameVal,
          lastName: lastNameVal,
          gender: genderVal || '',
          dateOfBirth: String(pickFirst(teacher, ['dateOfBirth', 'DateOfBirth', 'dob', 'Dob']) || ''),
          designation: designationVal || '',
          department: departmentVal || '',
          qualification: qualificationVal || '',
            employeeId: employeeIdVal, 
          experience: String(pickFirst(teacher, ['experience', 'Experience', 'experienceYears']) || ''),
          joiningDate: String(pickFirst(teacher, ['joiningDate', 'JoiningDate', 'dateOfJoining']) || ''),
          bloodGroup: bloodGroupVal || '',
          religion: religionVal || '',
          email: String(pickFirst(teacher, ['email', 'Email', 'emailAddress']) || ''),
          phone: String(pickFirst(teacher, ['phone', 'Phone', 'mobile', 'Mobile']) || ''),
          address: String(pickFirst(teacher, ['address', 'Address']) || ''),
          city: cityVal || '',
          state: stateVal || '',
          zipCode: String(pickFirst(teacher, ['zipCode', 'ZipCode', 'postalCode']) || ''),
          emergencyContact: String(pickFirst(teacher, ['emergencyContact', 'EmergencyContact']) || ''),
          salary: String(pickFirst(teacher, ['salary', 'Salary']) || ''),
          subjects: subjectVal || '',
          shortBio: String(pickFirst(teacher, ['shortBio', 'ShortBio', 'bio', 'Bio']) || ''),
        };

        setFormData((prev) => ({ ...prev, ...mapped }));
        setSelectedStateId(mapped.state || null);

        // If state exists, fetch cities for that state
        const stateId = mapped.state;
        if (stateId) {
          try {
            const cres = await fetch(`https://localhost:44328/api/Master/City_by-state/${stateId}`);
            if (cres.ok) {
              const cdata = await cres.json();
              setCities(Array.isArray(cdata) ? cdata : []);
            }
          } catch (e) {
            console.error('Failed to fetch cities', e);
          }
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load teacher data');
      }
    };

    fetchTeacher();
  }, [teacherId]);

  useEffect(() => {
    const resolvedStateId = resolveOptionValue(formData.state, states, ['stateId', 'id'], ['stateName', 'name']);
    if (resolvedStateId && resolvedStateId !== selectedStateId) {
      setSelectedStateId(resolvedStateId);
    }
  }, [formData.state, states, selectedStateId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, state: value, city: '' }));
    setSelectedStateId(value || null);
    setCities([]);
    if (!value) return;
    (async () => {
      try {
        const res = await fetch(`https://localhost:44328/api/Master/City_by-state/${value}`);
        if (!res.ok) return;
        const data = await res.json();
        setCities(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    })();
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setTouched({});
    setPhotoPreview(null);
    setPhotoFile(null);
    setSelectedStateId(null);
    setCities([]);
  };

  const getResolvedValue = (name: string) => {
    switch (name) {
      case 'gender':
        return resolveOptionValue(formData.gender, genders, ['genderId', 'id'], ['genderName', 'name']);
      case 'bloodGroup':
        return resolveOptionValue(formData.bloodGroup, bloodGroups, ['bloodGroupId', 'id'], ['bloodGroupName', 'name']);
      case 'religion':
        return resolveOptionValue(formData.religion, religions, ['religionId', 'id'], ['religionName', 'name']);
      case 'designation':
        return resolveOptionValue(formData.designation, designations, ['designationId', 'id'], ['designationName', 'name']);
      case 'department':
        return resolveOptionValue(formData.department, departments, ['departmentId', 'id'], ['departmentName', 'name']);
      case 'qualification':
        return resolveOptionValue(formData.qualification, qualifications, ['qualificationId', 'id'], ['qualificationName', 'name']);
      case 'subjects':
        return resolveOptionValue(formData.subjects, teachingSubjects, ['subjectId', 'id'], ['subjectName', 'name']);
      case 'state':
        return resolveOptionValue(formData.state, states, ['stateId', 'id'], ['stateName', 'name']);
      case 'city':
        return resolveOptionValue(formData.city, cities, ['cityId', 'id'], ['cityName', 'name']);
      default:
        return formData[name];
    }
  };

  const errors: Record<string, string | null> = {};

  const fieldProps = (name: string) => ({
    name,
    value: formData[name],
    onChange: handleInputChange,
    onBlur: handleBlur,
    className: inputCls(errors[name]),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const resolvedGenderId = resolveOptionValue(formData.gender, genders, ['genderId', 'id'], ['genderName', 'name']);
      const resolvedDesignationId = resolveOptionValue(formData.designation, designations, ['designationId', 'id'], ['designationName', 'name']);
      const resolvedDepartmentId = resolveOptionValue(formData.department, departments, ['departmentId', 'id'], ['departmentName', 'name']);
      const resolvedQualificationId = resolveOptionValue(formData.qualification, qualifications, ['qualificationId', 'id'], ['qualificationName', 'name']);
      const resolvedBloodGroupId = resolveOptionValue(formData.bloodGroup, bloodGroups, ['bloodGroupId', 'id'], ['bloodGroupName', 'name']);
      const resolvedReligionId = resolveOptionValue(formData.religion, religions, ['religionId', 'id'], ['religionName', 'name']);
      const resolvedSubjectId = resolveOptionValue(formData.subjects, teachingSubjects, ['subjectId', 'id'], ['subjectName', 'name']);
      const resolvedStateId = resolveOptionValue(formData.state, states, ['stateId', 'id'], ['stateName', 'name']);
      const resolvedCityId = resolveOptionValue(formData.city, cities, ['cityId', 'id'], ['cityName', 'name']);

    const payload = {
  Id: teacherId ? parseInt(teacherId, 10) : 0,

  FirstName: formData.firstName,
  LastName: formData.lastName,
  GenderId: parseInt(resolvedGenderId),
  DateOfBirth: formData.dateOfBirth,
  BloodGroupId: parseInt(resolvedBloodGroupId),
  ReligionId: parseInt(resolvedReligionId),

  Email: formData.email,
  Phone: formData.phone,
  EmployeeId: String(teacherId), // ✅ IMPORTANT

  DesignationId: parseInt(resolvedDesignationId),
  DepartmentId: parseInt(resolvedDepartmentId),
  QualificationId: parseInt(resolvedQualificationId),

  Experience: formData.experience ? parseInt(formData.experience) : 0,
  JoiningDate: formData.joiningDate,
  Salary: formData.salary ? parseFloat(formData.salary) : 0,

  SubjectId: resolvedSubjectId ? parseInt(resolvedSubjectId) : null,

  Address: formData.address,
  EmergencyContact: formData.emergencyContact,

  StateId: parseInt(resolvedStateId),
  CityId: parseInt(resolvedCityId),

  ZipCode: formData.zipCode,
  ShortBio: formData.shortBio
};



      console.log('📤 Sending payload to /api/Teacher/UpdateTeacher:', payload);

     const res = await fetch('https://localhost:44328/api/Teacher/UpdateTeacher', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
      console.log(`📥 Response status: ${res.status} ${res.statusText}`);
      const responseText = await res.text();
      console.log(`📥 Response body: ${responseText}`);

      if (res.ok) {
        console.log('✓ Update succeeded');
        toast.success('Teacher updated successfully');
        setTimeout(() => navigate('/admin/teachers'), 800);
        return;
      }

      // 405 = Method Not Allowed
      if (res.status === 405) {
        console.error('❌ 405 Method Not Allowed - Endpoint does not accept POST method');
        toast.error('Endpoint /api/Teacher/UpdateTeacher does not accept POST. Backend may need to use a different HTTP method or configure routing.');
        return;
      }

      // 401 = Unauthorized
      if (res.status === 401) {
        console.error('❌ 401 Unauthorized - Check authentication/authorization');
        toast.error('Authentication failed. Check your credentials.');
        return;
      }

      // 400 = Bad Request (validation error)
      if (res.status === 400) {
        console.error('❌ 400 Bad Request - Invalid payload format', responseText);
        toast.error(`Validation error: ${responseText}`);
        return;
      }

      toast.error(`Update failed: ${res.status} ${res.statusText}`);
    } catch (e) {
      console.error('❌ Network error:', e);
      toast.error('Network error while updating teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMsg = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
    ) : null;

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Update Teacher"
      breadcrumbs={["Home", "Admin", "Teachers", "Update Teacher"]}
    >
      <div className="space-y-6">
        {backendError && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4">
            <div className="text-sm text-red-800 whitespace-pre-line font-mono">{backendError}</div>
          </div>
        )}
        <Card className="bg-white border border-slate-200">
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} noValidate>
              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Personal Information</h3>
<div>
  <label className="block text-sm font-medium text-slate-700 mb-2">
    Employee ID
  </label>
  <input
    type="text"
    name="employeeId"
    value={formData.employeeId}
    disabled
    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed"
  />
</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">First Name <span className="text-red-500">*</span></label>
                    <input type="text" {...fieldProps('firstName')} />
                    <ErrorMsg name="firstName" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                    <input type="text" {...fieldProps('lastName')} />
                    <ErrorMsg name="lastName" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={getResolvedValue('gender')} onChange={handleInputChange} onBlur={handleBlur} className={inputCls(errors.gender)}>
                      <option value="">Select Gender *</option>
                      {genders.map((g) => (
                        <option key={getOptionId(g, ['genderId', 'id'])} value={getOptionId(g, ['genderId', 'id'])}>{getOptionLabel(g, ['genderName', 'name'])}</option>
                      ))}
                    </select>
                    <ErrorMsg name="gender" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                    <input type="date" {...fieldProps('dateOfBirth')} />
                    <ErrorMsg name="dateOfBirth" />
                  </div>
                </div>
              </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">



  {/* Email */}
  <div>
    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
      Email <span className="text-red-500">*</span>
    </label>
    <input type="email" {...fieldProps('email')} />
    <ErrorMsg name="email" />
  </div>

  {/* Phone */}
  <div>
    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
      Phone <span className="text-red-500">*</span>
    </label>
    <input type="tel" {...fieldProps('phone')} />
    <ErrorMsg name="phone" />
  </div>



  {/* Blood Group */}
  <div>
    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
      Blood Group <span className="text-red-500">*</span>
    </label>
    <select
      name="bloodGroup"
      value={getResolvedValue('bloodGroup')}
      onChange={handleInputChange}
      onBlur={handleBlur}
      className={inputCls(errors.bloodGroup)}
    >
      <option value="">Select Blood Group *</option>
      {bloodGroups.map((b) => (
        <option
          key={getOptionId(b, ['bloodGroupId', 'id'])}
          value={getOptionId(b, ['bloodGroupId', 'id'])}
        >
          {getOptionLabel(b, ['bloodGroupName', 'name'])}
        </option>
      ))}
    </select>
    <ErrorMsg name="bloodGroup" />
  </div>

  {/* Religion */}
  <div>
    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
      Religion <span className="text-red-500">*</span>
    </label>
    <select
      name="religion"
      value={getResolvedValue('religion')}
      onChange={handleInputChange}
      onBlur={handleBlur}
      className={inputCls(errors.religion)}
    >
      <option value="">Select Religion *</option>
      {religions.map((r) => (
        <option
          key={getOptionId(r, ['religionId', 'id'])}
          value={getOptionId(r, ['religionId', 'id'])}
        >
          {getOptionLabel(r, ['religionName', 'name'])}
        </option>
      ))}
    </select>
    <ErrorMsg name="religion" />
  </div>

</div>

            



              {/* Professional Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Professional Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Designation <span className="text-red-500">*</span></label>
                    <select name="designation" value={getResolvedValue('designation')} onChange={handleInputChange} onBlur={handleBlur} className={inputCls(errors.designation)}>
                      <option value="">Select Designation *</option>
                      {designations.map((g) => (
                        <option key={getOptionId(g, ['designationId', 'id'])} value={getOptionId(g, ['designationId', 'id'])}>{getOptionLabel(g, ['designationName', 'name'])}</option>
                      ))}
                    </select>
                    <ErrorMsg name="designation" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Department <span className="text-red-500">*</span></label>
                    <select name="department" value={getResolvedValue('department')} onChange={handleInputChange} onBlur={handleBlur} className={inputCls(errors.department)}>
                      <option value="">Select Department *</option>
                      {departments.map((g) => (
                        <option key={getOptionId(g, ['departmentId', 'id'])} value={getOptionId(g, ['departmentId', 'id'])}>{getOptionLabel(g, ['departmentName', 'name'])}</option>
                      ))}
                    </select>
                    <ErrorMsg name="department" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Qualification <span className="text-red-500">*</span></label>
                    <select name="qualification" value={getResolvedValue('qualification')} onChange={handleInputChange} onBlur={handleBlur} className={inputCls(errors.qualification)}>
                      <option value="">Select Qualification *</option>
                      {qualifications.map((g) => (
                        <option key={getOptionId(g, ['qualificationId', 'id'])} value={getOptionId(g, ['qualificationId', 'id'])}>{getOptionLabel(g, ['qualificationName', 'name'])}</option>
                      ))}
                    </select>
                    <ErrorMsg name="qualification" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Experience (Years)</label>
                    <input type="number" min="0" {...fieldProps('experience')} />
                    <ErrorMsg name="experience" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Joining Date <span className="text-red-500">*</span></label>
                    <input type="date" {...fieldProps('joiningDate')} />
                    <ErrorMsg name="joiningDate" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Salary</label>
                    <input type="number" min="0" {...fieldProps('salary')} />
                    <ErrorMsg name="salary" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Subjects Teaching</label>
                    <select name="subjects" value={getResolvedValue('subjects')} onChange={handleInputChange} onBlur={handleBlur} className={inputCls(errors.subjects)}>
                      <option value="">Select Subject</option>
                      {teachingSubjects.map((g) => (
                        <option key={getOptionId(g, ['subjectId', 'id'])} value={getOptionId(g, ['subjectId', 'id'])}>{getOptionLabel(g, ['subjectName', 'name'])}</option>
                      ))}
                    </select>
                    <ErrorMsg name="subjects" />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Address Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Address <span className="text-red-500">*</span></label>
                    <input type="text" {...fieldProps('address')} />
                    <ErrorMsg name="address" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Emergency Contact <span className="text-red-500">*</span></label>
                    <input type="tel" {...fieldProps('emergencyContact')} />
                    <ErrorMsg name="emergencyContact" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">State <span className="text-red-500">*</span></label>
                    <select name="state" value={getResolvedValue('state')} onChange={handleStateChange} onBlur={handleBlur} className={inputCls(errors.state)}>
                      <option value="">Select State *</option>
                      {states.map((g) => (
                        <option key={getOptionId(g, ['stateId', 'id'])} value={getOptionId(g, ['stateId', 'id'])}>{getOptionLabel(g, ['stateName', 'name'])}</option>
                      ))}
                    </select>
                    <ErrorMsg name="state" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">City <span className="text-red-500">*</span></label>
                    <select name="city" value={getResolvedValue('city')} onChange={handleInputChange} onBlur={handleBlur} className={inputCls(errors.city)}>
                      <option value="">Select City *</option>
                      {cities.map((g) => (
                        <option key={getOptionId(g, ['cityId', 'id'])} value={getOptionId(g, ['cityId', 'id'])}>{getOptionLabel(g, ['cityName', 'name'])}</option>
                      ))}
                    </select>
                    <ErrorMsg name="city" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Zip Code <span className="text-red-500">*</span></label>
                    <input type="text" {...fieldProps('zipCode')} />
                    <ErrorMsg name="zipCode" />
                  </div>
                </div>
              </div>

              {/* Bio & Photo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Short Bio</label>
                  <textarea name="shortBio" value={formData.shortBio} onChange={handleInputChange} onBlur={handleBlur} rows={6} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Upload Teacher Photo (150px × 150px)</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <div className="w-36 h-36 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-300">150×150</div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                        <p className="text-sm text-slate-500 mt-2">Supported: JPG, PNG. Max 2MB.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-200">
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
                  <Save className="w-4 h-4 mr-2" />{isSubmitting ? 'Saving...' : 'Update Teacher'}
                </Button>
                <Button type="button" onClick={handleReset} disabled={isSubmitting} className="flex-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 text-slate-700 py-3 border-2 border-slate-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset Form
                </Button>
                <Button type="button" variant="ghost" onClick={() => navigate('/admin/teachers')}>Cancel</Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}

export default UpdateTeacher;
