import { useEffect, useState } from 'react'
import StaffHeader from './StaffHeader'
import { api } from '../../lib/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../auth/useAuth'

function MyProfile() {
  const { profile, reloadProfile } = useAuth()
  
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    if (profile) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setDisplayName(profile.display_name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) {
      toast.error('Display name is required.')
      return
    }
    setSaving(true)
    try {
      await api.updateProfile({ displayName: displayName.trim(), phone: phone.trim() })
      toast.success('Profile details updated successfully.')
      await reloadProfile()
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!pw.current || !pw.next || !pw.confirm) {
      toast.error('All password fields are required.')
      return
    }
    if (pw.next.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }
    if (pw.next !== pw.confirm) {
      toast.error('New passwords do not match.')
      return
    }

    setPwSaving(true)
    try {
      await api.changePassword({ currentPassword: pw.current, newPassword: pw.next })
      toast.success('Password updated successfully.')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to update password.')
    } finally {
      setPwSaving(false)
    }
  }

  const roleLabel = profile?.role ? profile.role.toUpperCase().replace('_', ' ') : 'STAFF'

  return (
    <>
      <StaffHeader title="My Profile Settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header Card */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-700 to-purple-900 p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-gradient-to-tr from-white/10 to-transparent blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl font-bold">
                {profile?.display_name ? profile.display_name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{profile?.display_name}</h1>
                <p className="text-xs text-purple-200/90 font-mono mt-1 uppercase tracking-wider">
                  Role: {roleLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm space-y-6">
            
            {/* Account Details Form */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-purple-800">Edit Profile Details</h2>
                <p className="text-xs text-slate-500 mt-0.5">Update your display name and contact details.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                <Input
                  label="Email Address"
                  value={profile?.email || ''}
                  disabled
                  className="bg-slate-50 text-slate-500"
                />
                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Dr. John Doe"
                />
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +63 992-916-4078"
                />
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Saving Details…' : 'Save Details'}
                  </Button>
                </div>
              </form>
            </div>

            <hr className="border-purple-100" />

            {/* Change Password Form */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div>
                  <h2 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                    Change Password
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-100/70 text-purple-700 border border-purple-200/50">
                      {showPasswordForm ? 'Hide Form' : 'Expand Form'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage your credentials and security settings.</p>
                </div>
                <svg
                  className={`w-5 h-5 text-purple-700 transform transition-transform duration-200 ${
                    showPasswordForm ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showPasswordForm ? (
                <form onSubmit={handleChangePassword} className="space-y-4 pt-2 border-t border-purple-100">
                  <Input
                    label="Current Password"
                    type="password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    placeholder="••••••••"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    placeholder="At least 6 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    placeholder="At least 6 characters"
                  />
                  <div className="pt-2">
                    <Button type="submit" className="w-full" variant="secondary" disabled={pwSaving}>
                      {pwSaving ? 'Updating Password…' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              ) : null}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default MyProfile
