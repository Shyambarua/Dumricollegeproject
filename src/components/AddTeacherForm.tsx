import { useEffect, useState } from 'react';
import { Upload, User, Save, RotateCcw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { PortalLayout } from './PortalLayout';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const REQUIRED_FIELDS = [
  'firstName', 'lastName', 'gender', 'dateOfBirth', 'employeeId',
  'designation', 'department', 'qualification', 'bloodGroup', 'religion',
  'email', 'phone', 'joiningDate', 'address', 'emergencyContact',
  'state', 'city', 'zipCode',
];

const INITIAL_FORM: Record<string, string> = {
  firstName: '', lastName: '', gender: '', dateOfBirth: '', employeeId: '',
  designation: '', department: '', qualification: '', experience: '',
  joiningDate: '', bloodGroup: '', religion: '', email: '', phone: '',
  address: '', city: '', state: '', zipCode: '', emergencyContact: '',
  salary: '', subjects: '', shortBio: '',
};

function getFieldError(name: string, value: string): string | null {
  // if (REQUIRED_FIELDS.includes(name) && !value.trim()) return 'This field is required.';
  // if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
  //   return 'Enter a valid email address.';
  // if ((name === 'phone' || name === 'emergencyContact') && value && !/^\+?[0-9]{7,15}$/.test(value))
  //   return 'Enter a valid phone number (7–15 digits).';
  // if (name === 'zipCode' && value && !/^[0-9]{4,10}$/.test(value))
  //   return 'Zip code must be 4–10 digits.';
  return null;
}

// Reusable input class builder
function inputCls(error: string | null) {
  return [
    'w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border rounded-lg text-slate-900',
    'placeholder-slate-400 focus:outline-none focus:ring-2 text-sm transition-colors',
    error
      ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400'
      : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500',
  ].join(' ');
}

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

export function AddTeacherForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>(INITIAL_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});



  // ── Derived per-field errors (only shown when touched) ──────────────────────
  const errors: Record<string, string | null> = {};
  for (const key of Object.keys(formData)) {
    errors[key] = touched[key] ? getFieldError(key, formData[key]) : null;
  }

  const hasAnyError = Object.keys(formData).some(
    (k) => getFieldError(k, formData[k]) !== null
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
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
  const [genders, setGenders] = useState<any[]>([]);

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const res = await fetch('https://localhost:44328/api/Master/Genders');

        if (!res.ok) {
          throw new Error('Failed to fetch genders');
        }

        const data = await res.json();
        console.log("API Response:", data); // 🔍 debug

        setGenders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setGenders([]);
      }
    };

    fetchGenders();
  }, []);
const [bloodGroups, setBloodGroups] = useState<any[]>([]);
  useEffect(() => {
    const fetchBloodgroups = async () => {
      try {
        const res = await fetch('https://localhost:44328/api/Master/BloodGroup');

        if (!res.ok) {
          throw new Error('Failed to fetch blood groups');
        }

        const data = await res.json();
        console.log("API Response:", data); // 🔍 debug

        setBloodGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setBloodGroups([]);
      }
    };

    fetchBloodgroups();
  }, []);

  const [religions, setReligions] = useState<any[]>([]);
    useEffect(() => {
    const fetchReligions = async () => {
      try {
        const res = await fetch('https://localhost:44328/api/Master/Religions');

        if (!res.ok) {
          throw new Error('Failed to fetch blood groups');
        }

        const data = await res.json();
        console.log("API Response:", data); // 🔍 debug

        setReligions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setReligions([]);
      }
    };

    fetchReligions();
  }, []);

    const [designations, setDesignations] = useState<any[]>([]);
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await fetch('https://localhost:44328/api/Master/Designations');

        if (!res.ok) {
          throw new Error('Failed to fetch blood groups');
        }

        const data = await res.json();
        console.log("API Response:", data); // 🔍 debug

        setDesignations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setDesignations([]);
      }
    };

    fetchDesignations();
  }, []);

    const [departments, setDepartments] = useState<any[]>([]);
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch('https://localhost:44328/api/Master/Department');

        if (!res.ok) {
          throw new Error('Failed to fetch blood groups');
        }

        const data = await res.json();
        console.log("API Response:", data); // 🔍 debug

        setDepartments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);


    const [qualifications, setQualifications] = useState<any[]>([]);
    useEffect(() => {
    const fetchQualifications = async () => {
      try {
        const res = await fetch('https://localhost:44328/api/Master/Qualifications');

        if (!res.ok) {
          throw new Error('Failed to fetch blood groups');
        }

        const data = await res.json();
        console.log("API Response:", data); // 🔍 debug

        setQualifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setQualifications([]);
      }
    };

    fetchQualifications();
  }, []);

    const [teachingSubjects, setTeachingSubjects] = useState<any[]>([]);
      useEffect(() => {
    const fetchTeachingSubjects = async () => {
      try {
        const res = await fetch('https://localhost:44328/api/Master/Subjects');

        if (!res.ok) {
          throw new Error('Failed to fetch blood groups');
        }

        const data = await res.json();
        console.log("API Response:", data); // 🔍 debug

        setTeachingSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setTeachingSubjects([]);
      }
    };

    fetchTeachingSubjects();
  }, []);

      const [states, setStates] = useState<any[]>([]);
     useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch('https://localhost:44328/api/Master/States');

        if (!res.ok) {
          throw new Error('Failed to fetch blood groups');
        }

        const data = await res.json();
        console.log("API Response:", data); // 🔍 debug

        setStates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setStates([]);
      }
    };

    fetchStates();
  }, []);

      const [cities, setCities] = useState<any[]>([]);
    const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

useEffect(() => {
  if (!selectedStateId) return; // 🔥 avoid empty call

  const fetchCity = async () => {
    try {
      const res = await fetch(
        `https://localhost:44328/api/Master/City_by-state/${selectedStateId}`
      );

      const data = await res.json();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  fetchCity();
}, [selectedStateId]); // 🔥 runs when state changes


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Mark every field as touched so all errors surface at once
  //   const allTouched = Object.fromEntries(Object.keys(formData).map((k) => [k, true]));
  //   setTouched(allTouched);

  //   if (hasAnyError) {
  //     toast.error('Please fix the errors before submitting.');
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   try {
  //     const payload = new FormData();
  //     Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
  //     if (photoFile) payload.append('photo', photoFile);

  //     const response = await fetch('http://localhost:5258/api/teacher', {
  //       method: 'POST',
  //       body: payload,  
  //     });

  //     if (!response.ok) {
  //       const error = await response.json();
  //       throw new Error(error.message || 'Failed to add teacher');
  //     }

  //     toast.success('Teacher Added Successfully!', {
  //       description: `${formData.firstName} ${formData.lastName} has been added to the faculty.`,
  //     });
  //     setTimeout(() => navigate('/admin/teachers'), 1000);
  //   } catch (error) {
  //     toast.error('Failed to add teacher', {
  //       description: error instanceof Error ? error.message : 'Something went wrong.',
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched = Object.fromEntries(
      Object.keys(formData).map((k) => [k, true])
    );
    setTouched(allTouched);

    if (hasAnyError) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    debugger
    // try {
    //   const payload = new FormData();

    //   // Append all fields properly
    //   payload.append('firstName', formData.firstName);
    //   payload.append('lastName', formData.lastName);
    //   payload.append('gender', formData.gender);
    //   payload.append('dateOfBirth', formData.dateOfBirth);
    //   payload.append('employeeId', formData.employeeId);
    //   payload.append('designation', formData.designation);
    //   payload.append('department', formData.department);
    //   payload.append('qualification', formData.qualification);
    //   payload.append('experience', String(formData.experience));
    //   // payload.append('joiningDate', formData.joiningDate);
    //   payload.append('bloodGroup', formData.bloodGroup);
    //   payload.append('religion', formData.religion);
    //   payload.append('email', formData.email);
    //   payload.append('phone', formData.phone);
    //   payload.append('address', formData.address);
    //   payload.append('city', formData.city);
    //   payload.append('state', formData.state);
    //   payload.append('zipCode', formData.zipCode);
    //   payload.append('emergencyContact', formData.emergencyContact);
    //   payload.append('salary', String(formData.salary));
    //   payload.append('subjects', formData.subjects); // if string

    //   payload.append('shortBio', formData.shortBio);

    //   // Append file
    //   // if (photoFile) {
    //   //   payload.append('photo', photoFile);
    //   // }

    //   const response = await fetch(
    //     'https://localhost:44390/api/Teacher/add-teacher',
    //     {
    //       method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json', // crucial!
    //   },
    //   body: JSON.stringify(payload),
    //     }
    //   );

    //   if (!response.ok) {
    //     throw new Error('Failed to submit');
    //   }

    //   toast.success('Teacher added successfully!');
    // } catch (error) {
    //   console.error(error);
    //   toast.error('Something went wrong');
    // } finally {
    //   setIsSubmitting(false);
    // }
    
try {
  // Prepare payload as a plain JavaScript object
  // Convert string IDs to numbers for foreign key fields
  const payload = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    genderId: formData.gender ? parseInt(formData.gender, 10) : null,
    dateOfBirth: formData.dateOfBirth,
    employeeId: formData.employeeId,
    designationId: formData.designation ? parseInt(formData.designation, 10) : null,
    departmentId: formData.department ? parseInt(formData.department, 10) : null,
    qualificationId: formData.qualification ? parseInt(formData.qualification, 10) : null,
    experience: formData.experience ? parseInt(formData.experience, 10) : 0,
    joiningDate: formData.joiningDate,
    bloodGroupId: formData.bloodGroup ? parseInt(formData.bloodGroup, 10) : null,
    religionId: formData.religion ? parseInt(formData.religion, 10) : null,
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    cityId: formData.city ? parseInt(formData.city, 10) : null,
    stateId: formData.state ? parseInt(formData.state, 10) : null,
    zipCode: formData.zipCode,
    emergencyContact: formData.emergencyContact,
    salary: formData.salary ? parseFloat(formData.salary) : 0,
    subjectId: formData.subjects ? parseInt(formData.subjects, 10) : null,
    shortBio: formData.shortBio
  };

  // Send the request as JSON
  const response = await fetch('https://localhost:44328/api/Teacher', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // crucial for model binding
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    // Handle HTTP errors
    const errorText = await response.text();
    console.error('Error submitting teacher:', errorText);
    toast.error('Failed to submit teacher', {
      description: errorText || 'Check console for details.',
    });
    return;
  }

  const data = await response.json();
  console.log('Teacher submitted successfully:', data);
  toast.success('Teacher Added Successfully!', {
    description: `${formData.firstName} ${formData.lastName} has been added.`,
  });
  setTimeout(() => navigate('/admin/teachers'), 1500);

} catch (error) {
  console.error('Network or server error:', error);
} finally {
  setIsSubmitting(false);
}
  };

  // ── Field helpers ────────────────────────────────────────────────────────────
  const fieldProps = (name: string) => ({
    name,
    value: formData[name],
    onChange: handleInputChange,
    onBlur: handleBlur,
    className: inputCls(errors[name]),
  });

  const ErrorMsg = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
    ) : null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="Add New Teacher"
      breadcrumbs={['Home', 'Admin', 'Teachers', 'Add Teacher']}
    >
      <div className="space-y-6">
        <Card className="bg-white border border-slate-200">
          <div className="p-4 sm:p-6 lg:p-8">


            <form onSubmit={handleSubmit} noValidate>

              {/* ── Personal Information ───────────────────────────────── */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Personal Information
                </h3>

                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" {...fieldProps('firstName')} />
                    <ErrorMsg name="firstName" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" {...fieldProps('lastName')} />
                    <ErrorMsg name="lastName" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    {/* <select {...fieldProps('gender')}>
                      <option value="">Select Gender *</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select> */}
                    <select {...fieldProps('gender')}>
                      <option value="">Select Gender *</option>

                      {genders.map((g) => (
                        <option key={getOptionId(g, ['genderId', 'id'])} value={getOptionId(g, ['genderId', 'id'])}>
                          {getOptionLabel(g, ['genderName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="gender" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input type="date" {...fieldProps('dateOfBirth')} />
                    <ErrorMsg name="dateOfBirth" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('bloodGroup')}>
                      <option value="">Select Blood Group *</option>
                     {bloodGroups.map((g) => (
                        <option key={getOptionId(g, ['bloodGroupId', 'id'])} value={getOptionId(g, ['bloodGroupId', 'id'])}>
                          {getOptionLabel(g, ['bloodGroupName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="bloodGroup" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Religion <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('religion')}>
                      <option value="">Select Religion *</option>
                      {religions.map((g) => (
                        <option key={getOptionId(g, ['religionId', 'id'])} value={getOptionId(g, ['religionId', 'id'])}>
                          {getOptionLabel(g, ['religionName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="religion" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input type="email" {...fieldProps('email')} />
                    <ErrorMsg name="email" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input type="tel" {...fieldProps('phone')} />
                    <ErrorMsg name="phone" />
                  </div>
                </div>
              </div>

              {/* ── Professional Information ───────────────────────────── */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Professional Information
                </h3>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input type="text" {...fieldProps('employeeId')} />
                    <ErrorMsg name="employeeId" />
                  </div> */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('designation')}>
                      <option value="">Select Designation *</option>
                     {designations.map((g) => (
                        <option key={getOptionId(g, ['designationId', 'id'])} value={getOptionId(g, ['designationId', 'id'])}>
                          {getOptionLabel(g, ['designationName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="designation" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('department')}>
                      <option value="">Select Department *</option>
                     {departments.map((g) => (
                        <option key={getOptionId(g, ['departmentId', 'id'])} value={getOptionId(g, ['departmentId', 'id'])}>
                          {getOptionLabel(g, ['departmentName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="department" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Qualification <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('qualification')}>
                      <option value="">Select Qualification *</option>
                     {qualifications.map((g) => (
                        <option key={getOptionId(g, ['qualificationId', 'id'])} value={getOptionId(g, ['qualificationId', 'id'])}>
                          {getOptionLabel(g, ['qualificationName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="qualification" />
                  </div>
               
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Experience (Years)
                    </label>
                    <input type="number" min="0" {...fieldProps('experience')} />
                    <ErrorMsg name="experience" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <input type="date" {...fieldProps('joiningDate')} />
                    <ErrorMsg name="joiningDate" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Salary
                    </label>
                    <input type="number" min="0" {...fieldProps('salary')} />
                    <ErrorMsg name="salary" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Subjects Teaching
                    </label>
                    <select {...fieldProps('subjects')}>
                      <option value="">Select Subject</option>
                      {teachingSubjects.map((g) => (
                        <option key={getOptionId(g, ['subjectId', 'id'])} value={getOptionId(g, ['subjectId', 'id'])}>
                          {getOptionLabel(g, ['subjectName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="subjects" />
                  </div>
                </div>
              </div>

              {/* ── Address Information ────────────────────────────────── */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                  Address Information
                </h3>

                {/* Row 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input type="text" {...fieldProps('address')} />
                    <ErrorMsg name="address" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Emergency Contact <span className="text-red-500">*</span>
                    </label>
                    <input type="tel" {...fieldProps('emergencyContact')} />
                    <ErrorMsg name="emergencyContact" />
                  </div>
                </div>

                {/* Row 6 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleStateChange}
                      onBlur={handleBlur}
                      className={inputCls(errors.state)}
                    >
                      <option value="">Select State *</option>
                      {states.map((g) => (
                        <option key={getOptionId(g, ['stateId', 'id'])} value={getOptionId(g, ['stateId', 'id'])}>
                          {getOptionLabel(g, ['stateName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="state" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select {...fieldProps('city')}>
                      <option value="">Select City *</option>
                      {cities.map((g) => (
                        <option key={getOptionId(g, ['cityId', 'id'])} value={getOptionId(g, ['cityId', 'id'])}>
                          {getOptionLabel(g, ['cityName', 'name'])}
                        </option>
                      ))}
                    </select>
                    <ErrorMsg name="city" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input type="text" {...fieldProps('zipCode')} />
                    <ErrorMsg name="zipCode" />
                  </div>
                </div>
              </div>

              {/* ── Bio & Photo ────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Short Bio
                  </label>
                  <textarea
                    name="shortBio"
                    value={formData.shortBio}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    rows={6}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Upload Teacher Photo (150px × 150px)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Teacher preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                          <User className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center sm:items-start">
                      <label
                        htmlFor="photo-upload"
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer text-sm font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-slate-500 mt-2 text-center sm:text-left">
                        Recommended size: 150px × 150px
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Action Buttons ────────────────────────────────────── */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Teacher'}
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