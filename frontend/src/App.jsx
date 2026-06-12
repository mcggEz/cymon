import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ProfileSetupPersonal from './pages/client/ProfileSetupPersonal'
import ProfileSetupGuardian from './pages/client/ProfileSetupGuardian'
import ProfileSetupClinical from './pages/client/ProfileSetupClinical'
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

import PsychologistLayout from './pages/staff/PsychologistLayout'
import Approvals from './pages/staff/psychologist/Approvals'
import RosterOverview from './pages/staff/psychologist/RosterOverview'
import Mainstreaming from './pages/staff/psychologist/Mainstreaming'
import Interventions from './pages/staff/psychologist/Interventions'
import Progress from './pages/staff/psychologist/Progress'

import AdminLayout from './pages/staff/AdminLayout'
import AdminOverview from './pages/staff/admin/Overview'
import AdminPatients from './pages/staff/admin/Patients'
import AdminCompliance from './pages/staff/admin/Compliance'
import AdminSchedule from './pages/staff/admin/Schedule'
import AdminScoring from './pages/staff/admin/ScoringAnalytics'
import AdminDocuments from './pages/staff/admin/DocumentVault'
import AdminAnnouncements from './pages/staff/admin/Announcements'
import PsychometricianLayout from './pages/staff/PsychometricianLayout'
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

        <Route path="/setup/personal" element={<ProfileSetupPersonal />} />
        <Route path="/setup/guardian" element={<ProfileSetupGuardian />} />
        <Route path="/setup/clinical" element={<ProfileSetupClinical />} />

        <Route path="/client" element={<ClientLayout />}>
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

        <Route path="/psychologist" element={<PsychologistLayout />}>
          <Route index element={<Approvals />} />
          <Route path="roster" element={<RosterOverview />} />
          <Route path="mainstreaming" element={<Mainstreaming />} />
          <Route path="interventions" element={<Interventions />} />
          <Route path="progress" element={<Progress />} />
        </Route>

        <Route path="/psychometrician" element={<PsychometricianLayout />}>
          <Route index element={<Tasks />} />
          <Route path="assessments" element={<PmAssessments />} />
          <Route path="data-review" element={<DataReview />} />
          <Route path="activity" element={<PmActivityLog />} />
          <Route path="reports" element={<DraftingReports />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="compliance" element={<AdminCompliance />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="scoring" element={<AdminScoring />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
