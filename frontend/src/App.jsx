import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import ClientLayout from './pages/client/ClientLayout'
import HomeProgress from './pages/client/HomeProgress'
import DailyActivity from './pages/client/DailyActivity'
import MyProfile from './pages/client/MyProfile'
import AssessmentServices from './pages/client/AssessmentServices'
import Announcement from './pages/client/Announcement'
import Appointments from './pages/client/Appointments'
import Waivers from './pages/client/Waivers'
import WaiverDetail from './pages/client/WaiverDetail'
import RequireAuth from './auth/RequireAuth'

import PsychologistLayout from './pages/staff/PsychologistLayout'
import Approvals from './pages/staff/psychologist/Approvals'
import Progress from './pages/staff/psychologist/Progress'

import AdminLayout from './pages/staff/AdminLayout'
import AdminOverview from './pages/staff/admin/Overview'
import AdminPatients from './pages/staff/admin/Patients'
import AdminCompliance from './pages/staff/admin/Compliance'
import AdminSchedule from './pages/staff/admin/Schedule'
import AdminScoring from './pages/staff/admin/ScoringAnalytics'
import AdminAssessments from './pages/staff/admin/Assessments'
import AdminClinicalRecords from './pages/staff/admin/ClinicalRecords'
import AdminAnnouncements from './pages/staff/admin/Announcements'
import AdminEmployees from './pages/staff/admin/Employees'
import AdminAuditTrail from './pages/staff/admin/AuditTrail'
import AdminAttendance from './pages/staff/admin/AttendanceDashboard'
import PsychometricianLayout from './pages/staff/PsychometricianLayout'
import Tasks from './pages/staff/psychometrician/Tasks'
import PmAssessments from './pages/staff/psychometrician/Assessments'
import DataReview from './pages/staff/psychometrician/DataReview'
import PmActivityLog from './pages/staff/psychometrician/ActivityLog'
import DraftingReports from './pages/staff/psychometrician/DraftingReports'
import StudentJournal from './pages/staff/StudentJournal'
import StaffProfile from './pages/staff/MyProfile'

function App() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery') && hash.includes('access_token=')) {
      window.location.href = `/reset-password${hash}`
    }
  }, [])

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/client"
          element={
            <RequireAuth roles={['client']}>
              <ClientLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeProgress />} />
          <Route path="activity" element={<DailyActivity />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="assessments" element={<AssessmentServices />} />
          <Route path="announcements" element={<Announcement />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="waivers" element={<Waivers />} />
          <Route path="waivers/:id" element={<WaiverDetail />} />
        </Route>

        <Route
          path="/psychologist"
          element={
            <RequireAuth roles={['psychologist']}>
              <PsychologistLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Approvals />} />
          <Route path="data-review" element={<DataReview />} />
          <Route path="activity" element={<PmActivityLog />} />
          <Route path="student-journal" element={<StudentJournal />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="progress" element={<Progress />} />
          <Route path="reports" element={<DraftingReports />} />
        </Route>

        <Route
          path="/psychometrician"
          element={
            <RequireAuth roles={['psychometrician', 'speech_therapist', 'occupational_therapist']}>
              <PsychometricianLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Tasks />} />
          <Route path="assessments" element={<PmAssessments />} />
          <Route path="data-review" element={<DataReview />} />
          <Route path="activity" element={<PmActivityLog />} />
          <Route path="student-journal" element={<StudentJournal />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="progress" element={<Progress />} />
          <Route path="reports" element={<DraftingReports />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth roles={['admin']}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="compliance" element={<AdminCompliance />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="scoring" element={<AdminScoring />} />
          <Route path="assessments" element={<AdminAssessments />} />
          <Route path="activity" element={<PmActivityLog />} />
          <Route path="student-journal" element={<StudentJournal />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="progress" element={<Progress />} />
          <Route path="reports" element={<DraftingReports />} />
          <Route path="records" element={<AdminClinicalRecords />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="audit" element={<AdminAuditTrail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
