import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ClientLayout from './pages/client/ClientLayout'
import HomeProgress from './pages/client/HomeProgress'
import DailyActivity from './pages/client/DailyActivity'
import MyProfile from './pages/client/MyProfile'
import AssessmentCenter from './pages/client/AssessmentCenter'
import AssessmentDetail from './pages/client/AssessmentDetail'
import Announcement from './pages/client/Announcement'
import Appointments from './pages/client/Appointments'
import Waivers from './pages/client/Waivers'
import WaiverDetail from './pages/client/WaiverDetail'
import RequireAuth from './auth/RequireAuth'

import PsychologistLayout from './pages/staff/PsychologistLayout'
import Approvals from './pages/staff/psychologist/Approvals'
import RosterOverview from './pages/staff/psychologist/RosterOverview'
import Mainstreaming from './pages/staff/psychologist/Mainstreaming'
import Interventions from './pages/staff/psychologist/Interventions'
import Progress from './pages/staff/psychologist/Progress'
import IntakeInterview from './pages/staff/psychologist/IntakeInterview'
import ProgressNotes from './pages/staff/psychologist/ProgressNotes'

import AdminLayout from './pages/staff/AdminLayout'
import AdminOverview from './pages/staff/admin/Overview'
import AdminPatients from './pages/staff/admin/Patients'
import AdminCompliance from './pages/staff/admin/Compliance'
import AdminSchedule from './pages/staff/admin/Schedule'
import AdminScoring from './pages/staff/admin/ScoringAnalytics'
import AdminDocuments from './pages/staff/admin/DocumentVault'
import AdminAnnouncements from './pages/staff/admin/Announcements'
import AdminEmployees from './pages/staff/admin/Employees'
import AdminAuditTrail from './pages/staff/admin/AuditTrail'
import PsychometricianLayout from './pages/staff/PsychometricianLayout'
import OccupationalLayout from './pages/staff/OccupationalLayout'
import TherapyCaseload from './pages/staff/therapy/Caseload'
import TherapyRoutedReports from './pages/staff/therapy/RoutedReports'
import TherapySessionNotes from './pages/staff/therapy/SessionNotes'
import TherapyGoals from './pages/staff/therapy/Goals'
import Tasks from './pages/staff/psychometrician/Tasks'
import PmAssessments from './pages/staff/psychometrician/Assessments'
import DataReview from './pages/staff/psychometrician/DataReview'
import PmActivityLog from './pages/staff/psychometrician/ActivityLog'
import DraftingReports from './pages/staff/psychometrician/DraftingReports'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

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
          <Route path="assessments" element={<AssessmentCenter />} />
          <Route path="assessments/:id" element={<AssessmentDetail />} />
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
          <Route path="roster" element={<RosterOverview />} />
          <Route path="intake" element={<IntakeInterview />} />
          <Route path="progress-notes" element={<ProgressNotes />} />
          <Route path="mainstreaming" element={<Mainstreaming />} />
          <Route path="interventions" element={<Interventions />} />
          <Route path="progress" element={<Progress />} />
        </Route>

        <Route
          path="/psychometrician"
          element={
            <RequireAuth roles={['psychometrician', 'speech_therapist']}>
              <PsychometricianLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Tasks />} />
          <Route path="assessments" element={<PmAssessments />} />
          <Route path="data-review" element={<DataReview />} />
          <Route path="activity" element={<PmActivityLog />} />
          <Route path="reports" element={<DraftingReports />} />
        </Route>

        {/* Occupational therapist portal (UX preview — mock data).
            Speech therapists use the psychometrician portal per the clinic. */}
        <Route
          path="/occupational"
          element={
            <RequireAuth roles={['occupational_therapist']}>
              <OccupationalLayout />
            </RequireAuth>
          }
        >
          <Route index element={<TherapyCaseload />} />
          <Route path="reports" element={<TherapyRoutedReports />} />
          <Route path="sessions" element={<TherapySessionNotes />} />
          <Route path="goals" element={<TherapyGoals />} />
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
          <Route path="scoring" element={<AdminScoring />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="audit" element={<AdminAuditTrail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
