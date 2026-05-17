import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { ScrollToTop } from "./components/ScrollToTop";
import { ReapplyAdmission } from "./components/ReapplyAdmission";
import { RouteChangePreloader } from "./components/shared/RouteChangePreloader";
import { StudentView } from "./components/StudentView";
import { Approved } from "./components/pages/Approved";

// ─── Lazy-loaded route components ────────────────────────────────────────────
// Using .then(m => ({ default: m.ExportName })) to support named exports

// Public / Landing
const DumriCollegeLanding = lazy(() =>
  import("./components/DumriCollegeLanding")
);
const ModernUniversityLanding = lazy(() =>
  import("./components/ModernUniversityLanding").then((m) => ({
    default: m.ModernUniversityLanding,
  }))
);
const UniversityLandingPage = lazy(() =>
  import("./components/UniversityLandingPage").then((m) => ({
    default: m.UniversityLandingPage,
  }))
);
const EnhancedLandingPage = lazy(() =>
  import("./components/EnhancedLandingPage").then((m) => ({
    default: m.EnhancedLandingPage,
  }))
);
const FigmaLandingPage = lazy(() =>
  import("./components/FigmaLandingPage")
);

// Info pages
const AboutPage = lazy(() =>
  import("./components/pages/AboutPage").then((m) => ({
    default: m.AboutPage,
  }))
);
const AboutLayout = lazy(() =>
  import("./components/pages/AboutLayout").then((m) => ({
    default: m.AboutLayout,
  }))
);
const AboutOverview = lazy(() =>
  import("./components/pages/about/AboutOverview").then((m) => ({
    default: m.AboutOverview,
  }))
);
const Administration = lazy(() =>
  import("./components/pages/about/Administration").then((m) => ({
    default: m.Administration,
  }))
);
const Founder = lazy(() =>
  import("./components/pages/about/Founder").then((m) => ({
    default: m.Founder,
  }))
);
const PrincipalMessage = lazy(() =>
  import("./components/pages/about/PrincipalMessage").then((m) => ({
    default: m.PrincipalMessage,
  }))
);
const Alumni = lazy(() =>
  import("./components/pages/about/Alumni").then((m) => ({
    default: m.Alumni,
  }))
);
const MissionValuesPage = lazy(() =>
  import("./components/pages/MissionValuesPage").then((m) => ({
    default: m.MissionValuesPage,
  }))
);
const HistoryPage = lazy(() =>
  import("./components/pages/HistoryPage").then((m) => ({
    default: m.HistoryPage,
  }))
);
const CampusLifePage = lazy(() =>
  import("./components/pages/CampusLifePage").then((m) => ({
    default: m.CampusLifePage,
  }))
);
const ResearchPage = lazy(() =>
  import("./components/pages/ResearchPage").then((m) => ({
    default: m.ResearchPage,
  }))
);
const ScholarshipsPage = lazy(() =>
  import("./components/pages/ScholarshipsPage").then((m) => ({
    default: m.ScholarshipsPage,
  }))
);
const FAQPage = lazy(() =>
  import("./components/pages/FAQPage").then((m) => ({ default: m.FAQPage }))
);
const FacultyEngineeringPage = lazy(() =>
  import("./components/pages/FacultyEngineeringPage").then((m) => ({
    default: m.FacultyEngineeringPage,
  }))
);
const FacultySciencesPage = lazy(() =>
  import("./components/pages/FacultySciencesPage").then((m) => ({
    default: m.FacultySciencesPage,
  }))
);
const FacultyArtsPage = lazy(() =>
  import("./components/pages/FacultyArtsPage").then((m) => ({
    default: m.FacultyArtsPage,
  }))
);
const FacultyCommercePage = lazy(() =>
  import("./components/pages/FacultyCommercePage").then((m) => ({
    default: m.FacultyCommercePage,
  }))
);
const FacultyEducationPage = lazy(() =>
  import("./components/pages/FacultyEducationPage").then((m) => ({
    default: m.FacultyEducationPage,
  }))
);
const AcademicCalendarPage = lazy(() =>
  import("./components/pages/AcademicCalendarPage").then((m) => ({
    default: m.AcademicCalendarPage,
  }))
);
const CourseCatalogPage = lazy(() =>
  import("./components/pages/CourseCatalogPage").then((m) => ({
    default: m.CourseCatalogPage,
  }))
);
const HowToApplyPage = lazy(() =>
  import("./components/pages/HowToApplyPage").then((m) => ({
    default: m.HowToApplyPage,
  }))
);
const ProgramsPage = lazy(() =>
  import("./components/pages/ProgramsPage").then((m) => ({
    default: m.ProgramsPage,
  }))
);
const ProgramDetailPage = lazy(() =>
  import("./components/pages/ProgramDetailPage").then((m) => ({
    default: m.ProgramDetailPage,
  }))
);
const EventsPage = lazy(() =>
  import("./components/pages/EventsPage").then((m) => ({
    default: m.EventsPage,
  }))
);
const FeeStructurePage = lazy(() =>
  import("./components/pages/FeeStructurePage").then((m) => ({
    default: m.FeeStructurePage,
  }))
);
const AllFacultyPage = lazy(() =>
  import("./components/pages/AllFacultyPage").then((m) => ({
    default: m.AllFacultyPage,
  }))
);
const FacultyDetailPage = lazy(() =>
  import("./components/pages/FacultyDetailPage").then((m) => ({
    default: m.FacultyDetailPage,
  }))
);
const AdmissionRequirementsPage = lazy(() =>
  import("./components/pages/AdmissionRequirementsPage").then((m) => ({
    default: m.AdmissionRequirementsPage,
  }))
);
const IComProgramPage = lazy(() =>
  import("./components/pages/IComProgramPage").then((m) => ({
    default: m.IComProgramPage,
  }))
);
const IScProgramPage = lazy(() =>
  import("./components/pages/IScProgramPage").then((m) => ({
    default: m.IScProgramPage,
  }))
);
const IAProgramPage = lazy(() =>
  import("./components/pages/IAProgramPage").then((m) => ({
    default: m.IAProgramPage,
  }))
);
const NoticesPage = lazy(() =>
  import("./components/pages/NoticesPage").then((m) => ({
    default: m.NoticesPage,
  }))
);
const HolidayPage = lazy(() =>
  import("./components/pages/HolidayPage").then((m) => ({
    default: m.HolidayPage,
  }))
);
const FacultyOverviewPage = lazy(() =>
  import("./components/pages/FacultyOverviewPage").then((m) => ({
    default: m.FacultyOverviewPage,
  }))
);
const LibraryPage = lazy(() =>
  import("./components/pages/LibraryPage").then((m) => ({
    default: m.LibraryPage,
  }))
);
const SignupPage = lazy(() =>
  import("./components/pages/SignupPage").then((m) => ({
    default: m.SignupPage,
  }))
);
const Academics = lazy(() =>
  import("./components/Academics").then((m) => ({ default: m.Academics }))
);
const Gallery = lazy(() =>
  import("./components/Gallery").then((m) => ({ default: m.Gallery }))
);
const Contact = lazy(() =>
  import("./components/Contact").then((m) => ({ default: m.Contact }))
);

// Auth
const StudentLoginPage = lazy(() =>
  import("./components/StudentLoginPage").then((m) => ({
    default: m.StudentLoginPage,
  }))
);
const StaffLoginPage = lazy(() =>
  import("./components/StaffLoginPage").then((m) => ({
    default: m.StaffLoginPage,
  }))
);

// Admission
const AdmissionApplicationForm = lazy(() =>
  import("./components/AdmissionApplicationForm").then((m) => ({
    default: m.AdmissionApplicationForm,
  }))
);
const TrackApplication = lazy(() =>
  import("./components/TrackApplication").then((m) => ({
    default: m.TrackApplication,
  }))
);

// ─── Admin portal ─────────────────────────────────────────────────────────────
const EnhancedAdminDashboard = lazy(() =>
  import("./components/EnhancedAdminDashboard").then((m) => ({
    default: m.EnhancedAdminDashboard,
  }))
);
const AdmissionManagement = lazy(() =>
  import("./components/AdmissionManagement").then((m) => ({
    default: m.AdmissionManagement,
  }))
);
const TeacherManagement = lazy(() =>
  import("./components/TeacherManagement").then((m) => ({
    default: m.TeacherManagement,
  }))
);
const ViewTeacher = lazy(() =>
  import("./components/ViewTeacher").then((m) => ({
    default: m.ViewTeacher,
  }))
);
const ScheduleManagement = lazy(() =>
  import("./components/ScheduleManagement").then((m) => ({
    default: m.ScheduleManagement,
  }))
);
const CertificateRequestManagement = lazy(() =>
  import("./components/CertificateRequestManagement").then((m) => ({
    default: m.CertificateRequestManagement,
  }))
);
const FeeManagement = lazy(() =>
  import("./components/FeeManagement").then((m) => ({
    default: m.FeeManagement,
  }))
);
const Reports = lazy(() =>
  import("./components/Reports").then((m) => ({ default: m.Reports }))
);
const AdminFeePayment = lazy(() =>
  import("./components/AdminFeePayment").then((m) => ({
    default: m.AdminFeePayment,
  }))
);
const ExamManagement = lazy(() =>
  import("./components/ExamManagement").then((m) => ({
    default: m.ExamManagement,
  }))
);
const ExamDetail = lazy(() =>
  import("./components/ExamDetail").then((m) => ({
    default: m.ExamDetail,
  }))
);
const AllStudentsData = lazy(() =>
  import("./components/AllStudentsData").then((m) => ({
    default: m.AllStudentsData,
  }))
);
const AddStudentForm = lazy(() =>
  import("./components/AddStudentForm").then((m) => ({
    default: m.AddStudentForm,
  }))
);
const AddTeacherForm = lazy(() =>
  import("./components/AddTeacherForm").then((m) => ({
    default: m.AddTeacherForm,
  }))
);
const UpdateTeacher = lazy(() =>
  import("./components/UpdateTeacher").then((m) => ({ default: m.UpdateTeacher }))
);
const AccountManagement = lazy(() =>
  import("./components/AccountManagement").then((m) => ({
    default: m.AccountManagement,
  }))
);
const ClassManagement = lazy(() =>
  import("./components/ClassManagement").then((m) => ({
    default: m.ClassManagement,
  }))
);
const SubjectManagement = lazy(() =>
  import("./components/SubjectManagement").then((m) => ({
    default: m.SubjectManagement,
  }))
);
const AttendanceManagement = lazy(() =>
  import("./components/AttendanceManagement").then((m) => ({
    default: m.AttendanceManagement,
  }))
);
const NoticeManagement = lazy(() =>
  import("./components/NoticeManagement").then((m) => ({
    default: m.NoticeManagement,
  }))
);
const MessageManagement = lazy(() =>
  import("./components/MessageManagement").then((m) => ({
    default: m.MessageManagement,
  }))
);
const AddNewClass = lazy(() =>
  import("./components/AddNewClass").then((m) => ({ default: m.AddNewClass }))
);
const AddNewSubject = lazy(() =>
  import("./components/AddSubjectForm").then((m) => ({
    default: m.AddSubjectForm,
  }))
);
const AddSchedule = lazy(() =>
  import("./components/AddSchedule").then((m) => ({ default: m.AddSchedule }))
);
const ScheduleNewExam = lazy(() =>
  import("./components/ScheduleExamForm").then((m) => ({
    default: m.ScheduleExamForm,
  }))
);
const UpdateExam = lazy(() =>
  import("./components/UpdateExam").then((m) => ({ default: m.UpdateExam }))
);
const CreateNotice = lazy(() =>
  import("./components/CreateNoticeForm").then((m) => ({
    default: m.CreateNoticeForm,
  }))
);
const MarkAttendance = lazy(() =>
  import("./components/MarkAttendance").then((m) => ({
    default: m.MarkAttendance,
  }))
);
const AdminHoliday = lazy(() =>
  import("./components/AdminHoliday").then((m) => ({
    default: m.AdminHoliday,
  }))
);

// ─── Teacher portal ──────────────────────────────────────────────────────────
const TeacherDashboard = lazy(() =>
  import("./components/TeacherDashboard").then((m) => ({
    default: m.TeacherDashboard,
  }))
);
const TeacherStudents = lazy(() =>
  import("./components/TeacherStudents").then((m) => ({
    default: m.TeacherStudents,
  }))
);
const TeacherClasses = lazy(() =>
  import("./components/TeacherClasses").then((m) => ({
    default: m.TeacherClasses,
  }))
);
const TeacherSchedule = lazy(() =>
  import("./components/TeacherSchedule").then((m) => ({
    default: m.TeacherSchedule,
  }))
);
const TeacherAttendance = lazy(() =>
  import("./components/TeacherAttendance").then((m) => ({
    default: m.TeacherAttendance,
  }))
);
const TeacherExams = lazy(() =>
  import("./components/TeacherExams").then((m) => ({
    default: m.TeacherExams,
  }))
);
const TeacherAssignments = lazy(() =>
  import("./components/TeacherAssignments").then((m) => ({
    default: m.TeacherAssignments,
  }))
);
const TeacherNotices = lazy(() =>
  import("./components/TeacherNotices").then((m) => ({
    default: m.TeacherNotices,
  }))
);
const TeacherMessages = lazy(() =>
  import("./components/TeacherMessages").then((m) => ({
    default: m.TeacherMessages,
  }))
);
const TeacherHoliday = lazy(() =>
  import("./components/TeacherHoliday").then((m) => ({
    default: m.TeacherHoliday,
  }))
);

// ─── Student portal ─────────────────────────────────────────────────────────
const StudentDashboard = lazy(() =>
  import("./components/StudentDashboard").then((m) => ({
    default: m.StudentDashboard,
  }))
);
const DocumentUpload = lazy(() =>
  import("./components/DocumentUpload").then((m) => ({
    default: m.DocumentUpload,
  }))
);
const FeePayment = lazy(() =>
  import("./components/FeePayment").then((m) => ({ default: m.FeePayment }))
);
const CertificateDownload = lazy(() =>
  import("./components/CertificateDownload").then((m) => ({
    default: m.CertificateDownload,
  }))
);
const DigitalIDCard = lazy(() =>
  import("./components/DigitalIDCard").then((m) => ({
    default: m.DigitalIDCard,
  }))
);
const StudentGallery = lazy(() =>
  import("./components/StudentGallery").then((m) => ({
    default: m.StudentGallery,
  }))
);
const StudentClasses = lazy(() =>
  import("./components/StudentClasses").then((m) => ({
    default: m.StudentClasses,
  }))
);
const StudentSchedule = lazy(() =>
  import("./components/StudentSchedule").then((m) => ({
    default: m.StudentSchedule,
  }))
);
const StudentAttendance = lazy(() =>
  import("./components/StudentAttendance").then((m) => ({
    default: m.StudentAttendance,
  }))
);
const StudentExams = lazy(() =>
  import("./components/StudentExams").then((m) => ({
    default: m.StudentExams,
  }))
);
const StudentResults = lazy(() =>
  import("./components/StudentResults").then((m) => ({
    default: m.StudentResults,
  }))
);
const StudentAssignments = lazy(() =>
  import("./components/StudentAssignments").then((m) => ({
    default: m.StudentAssignments,
  }))
);
const StudentLibrary = lazy(() =>
  import("./components/StudentLibrary").then((m) => ({
    default: m.StudentLibrary,
  }))
);
const StudentNotices = lazy(() =>
  import("./components/StudentNotices").then((m) => ({
    default: m.StudentNotices,
  }))
);
const StudentMessages = lazy(() =>
  import("./components/StudentMessages").then((m) => ({
    default: m.StudentMessages,
  }))
);
const StudentFeeReceipt = lazy(() =>
  import("./components/StudentFeeReceipt").then((m) => ({
    default: m.StudentFeeReceipt,
  }))
);
const StudentHoliday = lazy(() =>
  import("./components/StudentHoliday").then((m) => ({
    default: m.StudentHoliday,
  }))
);

const Requestreapply = lazy(() =>
  import("./components/ReapplyAdmission").then((m) => ({
    default: m.ReapplyAdmission,
  }))
);

const RequestCertificate = lazy(() =>
  import("./components/RequestCertificate").then((m) => ({
    default: m.RequestCertificate,
  }))
);

// Not Found
const NotFound = lazy(() =>
  import("./components/NotFound").then((m) => ({ default: m.NotFound }))
);

// ─── Page-level loading fallback ────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}

// ─── Root layout ─────────────────────────────────────────────────────────────
function RootLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <RouteChangePreloader />
      <Outlet />
    </Suspense>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      // ── Landing / public ──────────────────────────────────────────────────
      { path: "/", Component: DumriCollegeLanding },


      // ── Info pages ───────────────────────────────────────────────────────
      {
        path: "/about",
        Component: AboutLayout,
        children: [
          { index: true, Component: AboutOverview },
          { path: "administration", Component: Administration },
          { path: "founder", Component: Founder },
          { path: "principal-message", Component: PrincipalMessage },
          { path: "alumni", Component: Alumni },
        ]
      },
      { path: "/mission-values", Component: MissionValuesPage },
      { path: "/history", Component: HistoryPage },
      { path: "/campus-life", Component: CampusLifePage },
      { path: "/research", Component: ResearchPage },
      { path: "/scholarships", Component: ScholarshipsPage },
      { path: "/faq", Component: FAQPage },
      { path: "/faculty/engineering", Component: FacultyEngineeringPage },
      { path: "/faculty/sciences", Component: FacultySciencesPage },
      { path: "/faculty/arts", Component: FacultyArtsPage },
      { path: "/faculty/commerce", Component: FacultyCommercePage },
      { path: "/faculty/education", Component: FacultyEducationPage },
      { path: "/academic-calendar", Component: AcademicCalendarPage },
      { path: "/course-catalog", Component: CourseCatalogPage },
      { path: "/how-to-apply", Component: HowToApplyPage },
      { path: "/programs", Component: ProgramsPage },
      { path: "/programs/icom", Component: IComProgramPage },
      { path: "/programs/isc", Component: IScProgramPage },
      { path: "/programs/ia", Component: IAProgramPage },
      { path: "/programs/:programId", Component: ProgramDetailPage },
      { path: "/events", Component: EventsPage },
      { path: "/fee-structure", Component: FeeStructurePage },
      { path: "/all-faculty", Component: AllFacultyPage },
      { path: "/faculty/:facultyId", Component: FacultyDetailPage },
      { path: "/admission-requirements", Component: AdmissionRequirementsPage },
      { path: "/notices", Component: NoticesPage },
      { path: "/holiday", Component: HolidayPage },
      { path: "/faculty", Component: FacultyOverviewPage },
      { path: "/library", Component: LibraryPage },
      { path: "/signup", Component: SignupPage },
      { path: "/academics", Component: Academics },
      { path: "/gallery", Component: Gallery },
      { path: "/contact", Component: Contact },

      // ── Auth ──────────────────────────────────────────────────────────────
      { path: "/studentlogin", Component: StudentLoginPage },
      { path: "/stafflogin", Component: StaffLoginPage },

      // ── Admission ─────────────────────────────────────────────────────────
      { path: "/apply", Component: AdmissionApplicationForm },

      // ── Admin portal ──────────────────────────────────────────────────────
      { path: "/admin/dashboard", Component: EnhancedAdminDashboard },
      { path: "/admin/admissions", Component: AdmissionManagement },
      { path: "/admin/teachers", Component: TeacherManagement },
      { path: "/admin/teacher-details/:teacherId", Component: ViewTeacher },
      { path: "/admin/schedule", Component: ScheduleManagement },
      { path: "/admin/certificates", Component: CertificateRequestManagement },
      { path: "/admin/fee", Component: FeeManagement },
      { path: "/admin/reports", Component: Reports },
      { path: "/admin/admin-fee-payment", Component: AdminFeePayment },
      { path: "/admin/exams", Component: ExamManagement },
      { path: "/admin/exams/:examId", Component: ExamDetail },
      { path: "/admin/exams/edit/:examId", Component: UpdateExam },
      { path: "/admin/students", Component: AllStudentsData },
      { path: "/admin/add-student", Component: AddStudentForm },
      {
    path: "/admin/students/:studentId",
    Component: StudentView,
  },
  {
    path: "/admin/students/:applicationId/approved",
    Component: Approved,
  },

      { path: "/admin/add-teacher", Component: AddTeacherForm },
      { path: "/admin/edit-teacher/:teacherId", Component: UpdateTeacher },
      { path: "/admin/account", Component: AccountManagement },
      { path: "/admin/classes", Component: ClassManagement },
      { path: "/admin/subjects", Component: SubjectManagement },
      { path: "/admin/attendance", Component: AttendanceManagement },
      { path: "/admin/notices", Component: NoticeManagement },
      { path: "/admin/view-notice/:id", Component: lazy(() => import("./components/ViewNotice")) },
      { path: "/admin/update-notice/:id", Component: lazy(() => import("./components/UpdateNotice")) },
      { path: "/admin/messages", Component: MessageManagement },
      { path: "/admin/add-class", Component: AddNewClass },
      { path: "/admin/add-subject", Component: AddNewSubject },
      { path: "/admin/add-schedule", Component: AddSchedule },
      { path: "/admin/schedule-exam", Component: ScheduleNewExam },
      { path: "/admin/create-notice", Component: CreateNotice },
      { path: "/admin/mark-attendance", Component: MarkAttendance },
      { path: "/admin/holiday", Component: AdminHoliday },

      // ── Teacher portal ────────────────────────────────────────────────────
      { path: "/teacher/dashboard", Component: TeacherDashboard },
      { path: "/teacher/students", Component: TeacherStudents },
      { path: "/teacher/classes", Component: TeacherClasses },
      { path: "/teacher/schedule", Component: TeacherSchedule },
      { path: "/teacher/attendance", Component: TeacherAttendance },
      { path: "/teacher/exams", Component: TeacherExams },
      { path: "/teacher/assignments", Component: TeacherAssignments },
      { path: "/teacher/notices", Component: TeacherNotices },
      { path: "/teacher/messages", Component: TeacherMessages },
      { path: "/teacher/holiday", Component: TeacherHoliday },

      // ── Student portal ────────────────────────────────────────────────────
      { path: "/student/dashboard", Component: StudentDashboard },
      { path: "/student/track-application", Component: TrackApplication },
      { path: "/student/classes", Component: StudentClasses },
      { path: "/student/schedule", Component: StudentSchedule },
      { path: "/student/attendance", Component: StudentAttendance },
      { path: "/student/exams", Component: StudentExams },
      { path: "/student/results", Component: StudentResults },
      { path: "/student/assignments", Component: StudentAssignments },
      { path: "/student/library", Component: StudentLibrary },
      { path: "/student/fees", Component: FeePayment },
      { path: "/student/documents", Component: DocumentUpload },
      { path: "/student/certificates", Component: CertificateDownload },
      { path: "/student/id-card", Component: DigitalIDCard },
      { path: "/student/gallery", Component: StudentGallery },
      { path: "/student/notices", Component: StudentNotices },
      { path: "/student/messages", Component: StudentMessages },
      { path: "/student/fee-receipt", Component: StudentFeeReceipt },
      { path: "/student/holiday", Component: StudentHoliday },
      { path: "/student/reapply", Component: ReapplyAdmission },
      { path: "/student/request-certificate", Component: RequestCertificate },

      // ── Fallback ─────────────────────────────────────────────────────────
      { path: "*", Component: NotFound },
    ],
  },
]);