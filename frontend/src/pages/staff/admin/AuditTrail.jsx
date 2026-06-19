import { useState } from 'react'
import StaffHeader from '../StaffHeader'

const MOCK_LOGS = [
  {
    id: 1,
    timestamp: '2026-03-30 15:42:12',
    actor: 'Dr. Leo Cruz (Psychologist)',
    category: 'Report Sign-off',
    summary: 'Digitally signed and approved GARS-3 report for patient CMPS-2026-001.',
    ipAddress: '192.168.10.45',
    device: 'macOS Chrome',
    hash: '8f4c3986a7d189de576f7b732bc027de8f1bc43f019f28d22de4c1a2bd7ef110',
    prevHash: 'a57affd32bc0189de576e8f4c39867b73c43f019f28d22de4c1a2bd7e110ffab'
  },
  {
    id: 2,
    timestamp: '2026-03-30 14:15:33',
    actor: 'Mary Santos (Psychometrician)',
    category: 'Assessment Scoring',
    summary: 'Finalized automated scoring metrics and draft calculations for MMSE assessment.',
    ipAddress: '192.168.10.88',
    device: 'Windows Edge',
    hash: 'a57affd32bc0189de576e8f4c39867b73c43f019f28d22de4c1a2bd7e110ffab',
    prevHash: 'dd80bc2de4c1a2bd7ef110ff8f4c3986a7d189de576f7b732bc027de8f1bc43f'
  },
  {
    id: 3,
    timestamp: '2026-03-30 11:05:04',
    actor: 'Administrator (Compliance Officer)',
    category: 'Record Decryption',
    summary: 'Authorized temporary decryption key access to intake developmental files under NPC 2023-04 protocols.',
    ipAddress: '192.168.1.10',
    device: 'Windows Firefox',
    hash: 'dd80bc2de4c1a2bd7ef110ff8f4c3986a7d189de576f7b732bc027de8f1bc43f',
    prevHash: '0d0721bc3986a7d189de576f7b732bc027de8f1bc43f019f28d22de4c1a2bd7e'
  },
  {
    id: 4,
    timestamp: '2026-03-30 09:30:18',
    actor: 'Therapist Diaz (Speech Pathologist)',
    category: 'Caseload Update',
    summary: 'Logged progress goals and milestone targets for speech therapy caseload.',
    ipAddress: '192.168.10.104',
    device: 'iOS Safari',
    hash: '0d0721bc3986a7d189de576f7b732bc027de8f1bc43f019f28d22de4c1a2bd7e',
    prevHash: '4a2db7ef1108f4c3986a7d189de576f7b732bc027de8f1bc43f019f28d22de4c'
  },
  {
    id: 5,
    timestamp: '2026-03-29 16:11:45',
    actor: 'Mary Rose (Caregiver)',
    category: 'Intake Submission',
    summary: 'Submitted digital health profiling and guardian intake consent waiver FO-02.',
    ipAddress: '112.198.88.23',
    device: 'Android Chrome',
    hash: '4a2db7ef1108f4c3986a7d189de576f7b732bc027de8f1bc43f019f28d22de4c',
    prevHash: '9d2a3c7b0fbc3986a7d189de576f7b732bc027de8f1bc43f019f28d22de4c1a2'
  },
  {
    id: 6,
    timestamp: '2026-03-29 10:04:12',
    actor: 'System Daemon (CyMon Auth)',
    category: 'Access Granted',
    summary: 'Successful user authentication session initialized for role: psychologist.',
    ipAddress: '192.168.10.45',
    device: 'macOS Chrome',
    hash: '9d2a3c7b0fbc3986a7d189de576f7b732bc027de8f1bc43f019f28d22de4c1a2',
    prevHash: '8c9e2a3d7b0fbc3986a7d189de576f7b732bc027de8f1bc43f019f28d22de4c1'
  }
]

function AuditTrail() {
  const [logs] = useState(MOCK_LOGS)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedLog, setSelectedLog] = useState(null)

  const categories = ['All', 'Report Sign-off', 'Assessment Scoring', 'Record Decryption', 'Caseload Update', 'Intake Submission', 'Access Granted']

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.ipAddress.includes(searchTerm)
    const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <StaffHeader title="System Audit Trail" subtitle="Monday, March 30, 2026 — System Logs & Compliance" showSearch={false} />
      
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        
        {/* Page Overview Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">Compliance & Cryptographic Logs</h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-3xl">
            This trail provides a read-only, cryptographically verified record of system operations. All actions affecting patient developmental files, clinical reports, and key database accesses are cryptographically signed to maintain compliance with DPA 2012 and NPC Circular 2023-04 protocols.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by actor, detail or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet/10 transition-all font-sans"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet cursor-pointer font-sans"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-purple-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-purple-100">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Timestamp</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Actor</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Category</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Detail</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">IP Address</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono text-center">Security</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-sm text-slate-400 font-light">
                      No matching audit logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.actor}</td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap">
                        <span className="inline-block bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                          {log.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-light max-w-xs md:max-w-md truncate group-hover:text-slate-800 transition-colors">
                        {log.summary}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {log.ipAddress} <span className="text-[10px] text-slate-400">({log.device})</span>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-full text-[10px] uppercase tracking-wider border border-green-200">
                          <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          SHA-256
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Log Block Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
            <div className="bg-white rounded-2xl border border-purple-200 shadow-2xl max-w-xl w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-purple-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Audit Log Details</h3>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: {selectedLog.id} · Verified Block</p>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)} 
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Timestamp</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedLog.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">IP / Device</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedLog.ipAddress} ({selectedLog.device})</span>
                  </div>
                </div>

                <div className="border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Actor</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedLog.actor}</span>
                </div>

                <div className="border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Category</span>
                  <span className="text-xs inline-block bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded uppercase mt-0.5 tracking-wider">
                    {selectedLog.category}
                  </span>
                </div>

                <div className="border-b border-slate-50 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Event Summary</span>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed font-light">{selectedLog.summary}</p>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[10px] leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-500 uppercase block tracking-wider">Block SHA-256 Hash</span>
                    <span className="text-purple-700 break-all select-all font-semibold">{selectedLog.hash}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase block tracking-wider">Previous Block Hash</span>
                    <span className="text-slate-600 break-all select-all">{selectedLog.prevHash}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-600 font-semibold pt-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Cryptographic Integrity Shield Active (DPA 2012 Verified)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  )
}

export default AuditTrail
