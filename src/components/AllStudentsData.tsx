import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  Search,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Mail,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
  Plus,
  Megaphone,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PortalLayout } from './PortalLayout';
import { ExportDropdown } from './ExportDropdown';
import { deleteStudentById, getStudentApplications } from '../api/studentApi';
import type { StudentApplication } from '../types/studentTypes';

type StudentTableRow = {
  id: string;
  studentId: string;
  roll: string;
  applicationNo: string;
  registrationNo: string | null;
  name: string;
  className: string;
  gender: string;
  mobileNumber: string;
  applicationStatus: string;
  status: string;
  createdDateRaw: string;
};

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
}

export function AllStudentsData() {
  const navigate = useNavigate();
  const [studentsData, setStudentsData] = useState<StudentTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchApplicationNo, setSearchApplicationNo] = useState('');
  const [searchRegistrationNo, setSearchRegistrationNo] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      try {
        setIsLoading(true);
        setFetchError('');

        const applicationsResult = await getStudentApplications();
        if (!mounted) return;

        const mappedStudents: StudentTableRow[] = applicationsResult.map((student, index) => {
          const applicationId = student.applicationId;
          const registrationNo = student.registrationNo;
          const applicationNo = student.applicationNo;
          const studentName = student.studentName;
          const mobileNumber = student.mobileNumber;
          const gender = student.gender;
          const className = student.className;
          const applicationStatus = student.applicationStatus;
          const status = student.status;
          const createdDateRaw = student.createdDateRaw;
          const studentId = student.studentId;

          return {
            id: String(applicationId ?? index),
            studentId: String(studentId ?? applicationId ?? index),
            roll: String(registrationNo || applicationNo || 'Pending'),
            applicationNo: String(applicationNo || '-'),
            registrationNo: registrationNo ? String(registrationNo) : null,
            name: String(studentName || '-'),
            className: String(className || '-'),
            gender: String(gender || '-'),
            mobileNumber: String(mobileNumber || '-'),
            applicationStatus: String(applicationStatus || 'Pending'),
            status: String(status || applicationStatus || 'Pending'),
            createdDateRaw: createdDateRaw || '',
          };
        });

        setStudentsData(mappedStudents);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadStudents();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudents(studentsData.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((sid) => sid !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteStudent = async (student: StudentTableRow) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${student.name}?`);
    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingStudentId(student.id);
      setFetchError('');
      await deleteStudentById(student.studentId);

      setStudentsData((prev) => prev.filter((item) => item.id !== student.id));
      setSelectedStudents((prev) => prev.filter((selectedId) => selectedId !== student.id));
      setOpenActionMenu(null);
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : 'Failed to delete student');
    } finally {
      setDeletingStudentId(null);
    }
  };

  const filteredStudents = studentsData.filter((student) => {
    const matchApplicationNo = student.applicationNo.toLowerCase().includes(searchApplicationNo.toLowerCase());
    const matchRegistrationNo = (student.registrationNo ?? '').toLowerCase().includes(searchRegistrationNo.toLowerCase());
    const matchClass = student.className.toLowerCase().includes(searchClass.toLowerCase());
    const createdDateValue = student.createdDateRaw ? new Date(student.createdDateRaw).getTime() : NaN;
    const matchFromDate = !fromDate || (!Number.isNaN(createdDateValue) && createdDateValue >= new Date(fromDate).getTime());
    const matchToDate = !toDate || (!Number.isNaN(createdDateValue) && createdDateValue <= new Date(toDate).getTime());
    return matchApplicationNo && matchRegistrationNo && matchClass && matchFromDate && matchToDate;
  });

  // Sort filtered students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = String(a[sortField as keyof typeof a] ?? '').toLowerCase();
    const bValue = String(b[sortField as keyof typeof b] ?? '').toLowerCase();
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

  // Reset to page 1 when rows per page changes
  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <PortalLayout
      role="admin"
      userName="Stevie Zone"
      userRole="Admin"
      pageTitle="All Students Data"
      breadcrumbs={["Home", "Admin", "Students"]}
    >
      <div className="space-y-6">
        {/* Add Student Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => navigate('/admin/add-student')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-2.5 h-auto border-0 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Student
          </Button>
        </div>

            {/* Main Card */}
            <Card className="bg-white border border-slate-200 overflow-hidden shadow-sm">
              {/* Search Section */}
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="w-full">
                    <label className="text-sm text-slate-700 mb-2 block font-medium">Search by Application No</label>
                    <input
                      type="text"
                      placeholder="Search by Application No..."
                      value={searchApplicationNo}
                      onChange={(e) => setSearchApplicationNo(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-sm text-slate-700 mb-2 block font-medium">Search by Registration No</label>
                    <input
                      type="text"
                      placeholder="Search by Registration No..."
                      value={searchRegistrationNo}
                      onChange={(e) => setSearchRegistrationNo(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-sm text-slate-700 mb-2 block font-medium">Search by Class</label>
                    <input
                      type="text"
                      placeholder="Search by Class..."
                      value={searchClass}
                      onChange={(e) => setSearchClass(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-sm text-slate-700 mb-2 block font-medium">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-sm text-slate-700 mb-2 block font-medium">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 h-auto border-0 font-semibold text-sm shadow-lg shadow-blue-500/20">
                  <Search className="w-4 h-4 mr-2" />
                  SEARCH
                </Button>
              </div>

              {/* Action Buttons and Rows Per Page */}
              <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <ExportDropdown />
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none border-slate-300 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 transition-all duration-200 text-sm"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Print</span>
                    <span className="sm:hidden">Print</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none border-slate-300 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 transition-all duration-200 text-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Send Email ({selectedStudents.length})</span>
                    <span className="sm:hidden">Email ({selectedStudents.length})</span>
                  </Button>
                </div>
                
                {/* Rows Per Page Selector */}
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

              {isLoading && (
                <div className="p-4 sm:p-6 border-b border-slate-200 text-sm text-slate-600">Loading students...</div>
              )}

              {!isLoading && fetchError && (
                <div className="p-4 sm:p-6 border-b border-slate-200 text-sm text-red-600">{fetchError}</div>
              )}

              {/* Table - Desktop View */}
              <div className="hidden lg:block overflow-x-auto table-scroll no-sticky-shadow">
                <div className="w-full">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="px-4 xl:px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </th>
                        <th
                          className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                          onClick={() => handleSort('registrationNo')}
                        >
                          <div className="flex items-center gap-2">
                            Registration No
                            {sortField === 'registrationNo' ? (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4 opacity-0" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                          onClick={() => handleSort('applicationNo')}
                        >
                          <div className="flex items-center gap-2">
                            Application No
                            {sortField === 'applicationNo' ? (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4 opacity-0" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Student Name
                            {sortField === 'name' ? (
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
                          onClick={() => handleSort('gender')}
                        >
                          <div className="flex items-center gap-2">
                            Gender
                            {sortField === 'gender' ? (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4 opacity-0" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                          onClick={() => handleSort('applicationStatus')}
                        >
                          <div className="flex items-center gap-2">
                            Application Status
                            {sortField === 'applicationStatus' ? (
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
                        <th
                          className="px-4 xl:px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:text-slate-900"
                          onClick={() => handleSort('mobileNumber')}
                        >
                          <div className="flex items-center gap-2">
                            Mobile Number
                            {sortField === 'mobileNumber' ? (
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
                      {paginatedStudents.map((student, index) => (
                        <motion.tr
                          key={student.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
                        >
                          <td className="px-4 xl:px-6 py-3">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleSelectStudent(student.id)}
                              className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <span className="text-slate-900 font-semibold text-sm">{student.registrationNo || '-'}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <span className="text-slate-900 font-semibold text-sm">{student.applicationNo}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <span className="text-slate-900 font-semibold text-sm">{student.name}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <span className="text-slate-700 text-sm">{student.className}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <span className="text-slate-700 text-sm">{student.gender}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <Badge
                              className={`border-0 ${
                                student.applicationStatus.toLowerCase() === 'approved'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                  : student.applicationStatus.toLowerCase() === 'rejected'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {student.applicationStatus}
                            </Badge>
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <span className="text-slate-700 text-sm">{student.status}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <span className="text-slate-700 text-sm">{student.mobileNumber}</span>
                          </td>
                          <td className="px-4 xl:px-6 py-3">
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenActionMenu(openActionMenu === student.id ? null : student.id)
                                }
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-5 h-5 text-slate-600" />
                              </button>
                              {openActionMenu === student.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-10"
                                >
                                  <div className="py-2">
                                    <button 
                                      onClick={() => navigate(`/admin/students/${student.id}`)}
                                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </button>
                                    <button 
                                      onClick={() => {
                                        navigate(`/admin/edit-student/${student.id}`);
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit Student
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigate(`/admin/students/${student.id}/approved`);
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Approved
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors">
                                      <Mail className="w-4 h-4" />
                                      Send Email
                                    </button>
                                    <hr className="border-slate-200 my-2" />
                                    <button
                                      onClick={() => void handleDeleteStudent(student)}
                                      disabled={deletingStudentId === student.id}
                                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      {deletingStudentId === student.id ? 'Deleting...' : 'Delete Student'}
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-200">
                {paginatedStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <h3 className="text-slate-900 font-semibold text-base">{student.name}</h3>
                            <p className="text-blue-600 text-sm font-medium">{student.roll}</p>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenActionMenu(openActionMenu === student.id ? null : student.id)
                              }
                              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-slate-600" />
                            </button>
                            {openActionMenu === student.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-10"
                              >
                                <div className="py-2">
                                  <button 
                                    onClick={() => navigate(`/admin/students/${student.id}`)}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </button>
                                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3">
                                    <Edit className="w-4 h-4" />
                                    Edit Student
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigate(`/admin/students/${student.id}/approved`);
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approved
                                  </button>
                                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3">
                                    <Mail className="w-4 h-4" />
                                    Send Email
                                  </button>
                                  <hr className="border-slate-200 my-2" />
                                  <button
                                    onClick={() => void handleDeleteStudent(student)}
                                    disabled={deletingStudentId === student.id}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    {deletingStudentId === student.id ? 'Deleting...' : 'Delete Student'}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-slate-500">Registration No:</span>
                            <span className="text-slate-700 ml-2">{student.registrationNo || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Roll:</span>
                            <span className="text-slate-700 ml-2">{student.roll}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Application No:</span>
                            <span className="text-slate-700 ml-2">{student.applicationNo}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Name:</span>
                            <span className="text-slate-700 ml-2">{student.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Class:</span>
                            <span className="text-slate-700 ml-2">{student.className}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Gender:</span>
                            <span className="text-slate-700 ml-2">{student.gender}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Application Status:</span>
                            <Badge
                              className={`border-0 ml-2 ${
                                student.applicationStatus.toLowerCase() === 'approved'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                  : student.applicationStatus.toLowerCase() === 'rejected'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {student.applicationStatus}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-slate-500">Status:</span>
                            <span className="text-slate-700 ml-2">{student.status}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500">Mobile Number:</span>
                            <span className="text-slate-700 ml-2">{student.mobileNumber}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200">
                <div className="text-xs sm:text-sm text-slate-600">
                  Showing <span className="text-slate-900 font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="text-slate-900 font-semibold">{Math.min(endIndex, sortedStudents.length)}</span> of{' '}
                  <span className="text-slate-900 font-semibold">{sortedStudents.length}</span> students
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 transition-all duration-200 text-sm px-3 sm:px-4"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Button
                      key={index + 1}
                      variant={currentPage === index + 1 ? "default" : "outline"}
                      className={`${
                        currentPage === index + 1 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-0' 
                          : 'border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 transition-all duration-200'
                      } font-semibold text-sm px-3 sm:px-4`}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 transition-all duration-200 text-sm px-3 sm:px-4"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
    </PortalLayout>
  );
}