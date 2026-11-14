import { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Check,
  Copy,
  Download,
  Eye,
  Home,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import {
  adminModerateOpportunity,
  adminResolveReport,
  adminSetStudentSuspension,
  adminSetStudentVerification,
  deleteIdea,
  exportStudentsToCsv,
  subscribeAdminReports,
  subscribeAllIdeasForAdmin,
  subscribeAuditLogs,
  subscribeOpportunities,
  subscribePublicStudents,
  subscribeStudentPrivateInfos,
} from '../lib/kluService';
import {
  ACADEMIC_YEARS,
  ADMIN_BOOTSTRAP_EMAIL,
  ARCHETYPES,
  BRANCHES,
  getArchetypeMeta,
  type AuditLog,
  type ContentReport,
  type Opportunity,
  type StartupIdea,
  type StudentPrivate,
  type StudentPublic,
} from '../types/klu';
import { TribePassCard } from './TribePassCard';

interface AdminDashboardViewProps {
  adminUid: string;
  adminEmail: string;
  ideas: StartupIdea[];
  onGoHome: () => void;
}

function formatFirestoreDate(ts?: { toDate?: () => Date }): string {
  if (!ts?.toDate) return 'Pending sync';
  try {
    return ts.toDate().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function AdminDashboardView({
  adminUid,
  adminEmail,
  ideas,
  onGoHome,
}: AdminDashboardViewProps) {
  const isAuthorizedAdmin =
    adminEmail.trim().toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const [adminTab, setAdminTab] = useState<
    'students' | 'opportunities' | 'ideas' | 'reports' | 'logs'
  >('students');

  const [allStudents, setAllStudents] = useState<StudentPublic[]>([]);
  const [privateMap, setPrivateMap] = useState<Record<string, StudentPrivate>>({});
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);
  const [liveAllIdeas, setLiveAllIdeas] = useState<StartupIdea[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [selectedStudentUid, setSelectedStudentUid] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');

  useEffect(() => {
    if (!isAuthorizedAdmin) return;
    const unsubStudents = subscribePublicStudents(setAllStudents, true);
    const unsubOpps = subscribeOpportunities(setAllOpportunities, true);
    const unsubIdeas = subscribeAllIdeasForAdmin(setLiveAllIdeas);
    const unsubReports = subscribeAdminReports(setReports);
    const unsubLogs = subscribeAuditLogs(setAuditLogs);
    return () => {
      unsubStudents();
      unsubOpps();
      unsubIdeas();
      unsubReports();
      unsubLogs();
    };
  }, [isAuthorizedAdmin]);

  const studentUidsKey = useMemo(
    () => allStudents.map((s) => s.uid).sort().join(','),
    [allStudents]
  );

  useEffect(() => {
    if (!isAuthorizedAdmin) return;
    const uids = studentUidsKey ? studentUidsKey.split(',') : [];
    const unsubPrivate = subscribeStudentPrivateInfos(uids, setPrivateMap);
    return () => unsubPrivate();
  }, [isAuthorizedAdmin, studentUidsKey]);

  if (!isAuthorizedAdmin) {
    return (
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-8 text-center space-y-4 shadow-xs">
        <p className="text-sm font-medium text-[#C8102E]">
          Access restricted to authorized KLU TRIBE administrator.
        </p>
        <button
          type="button"
          onClick={onGoHome}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
        >
          <Home className="w-3.5 h-3.5 text-[#C8102E]" />
          Go To Home page
        </button>
      </div>
    );
  }

  const displayedIdeas = liveAllIdeas.length > 0 ? liveAllIdeas : ideas;

  const filteredStudents = allStudents.filter((s) => {
    if (branchFilter !== 'ALL' && s.branch !== branchFilter) return false;
    if (yearFilter !== 'ALL' && s.year !== yearFilter) return false;
    if (categoryFilter !== 'ALL' && s.primaryCategory !== categoryFilter) return false;
    if (campusFilter !== 'ALL' && s.campusMode !== campusFilter) return false;
    if (verificationFilter !== 'ALL' && s.verificationStatus !== verificationFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const priv = privateMap[s.uid];
      const hay = [
        s.fullName,
        s.memberNumber,
        s.maskedStudentId,
        priv?.kluStudentId || '',
        priv?.email || '',
        priv?.phone || '',
        priv?.gender || '',
        s.skills.join(' '),
        s.secondaryInterests.join(' '),
        s.careerGoal,
        s.bio,
        s.startupIdeaSummary,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const verifiedCount = allStudents.filter((s) => s.verificationStatus === 'verified').length;
  const pendingVerifyCount = allStudents.filter((s) => s.verificationStatus === 'pending_review').length;
  const openReportsCount = reports.filter((r) => r.status === 'open').length;
  const pendingOppsCount = allOpportunities.filter((o) => o.approvalStatus === 'pending').length;

  const selectedStudent = selectedStudentUid
    ? allStudents.find((s) => s.uid === selectedStudentUid) || null
    : null;
  const selectedPrivate = selectedStudent ? privateMap[selectedStudent.uid] : undefined;

  const copyValue = async (label: string, val: string) => {
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 1600);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">Admin Control Center</h1>
          <p className="text-sm text-zinc-600">
            Live student directory with real institutional IDs, private contacts, verification, opportunities, and audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 hover:border-zinc-400 hover:text-zinc-950 whitespace-nowrap shrink-0 shadow-xs"
          >
            <Home className="w-3.5 h-3.5 text-[#C8102E]" />
            Go To Home page
          </button>

          <button
            type="button"
            onClick={() => exportStudentsToCsv(filteredStudents, privateMap)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] whitespace-nowrap shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Full Live CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs text-zinc-500">Total Registered</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-zinc-950">{allStudents.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs text-zinc-500">Verified Students</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-700">
            {verifiedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs text-zinc-500">Pending ID Review</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-amber-600">
            {pendingVerifyCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs text-zinc-500">Pending Opportunities</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-700">
            {pendingOppsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs text-zinc-500">Open Reports</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#C8102E]">
            {openReportsCount}
          </p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
        {[
          { id: 'students', label: `Students (${allStudents.length})` },
          { id: 'opportunities', label: `Opportunities (${allOpportunities.length})` },
          { id: 'ideas', label: `Startup Ideas (${displayedIdeas.length})` },
          { id: 'reports', label: `Reports (${openReportsCount} open)` },
          { id: 'logs', label: `Audit Logs (${auditLogs.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAdminTab(t.id as typeof adminTab)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              adminTab === t.id
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adminTab === 'students' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 shadow-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, KLU ID, email, phone, skill..."
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
            />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              <option value="ALL">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              <option value="ALL">All Years</option>
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {ARCHETYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.subtitle}</option>
              ))}
            </select>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              <option value="ALL">All Campus Modes</option>
              <option value="Hosteller">Hosteller</option>
              <option value="Day Scholar">Day Scholar</option>
            </select>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              <option value="ALL">All Verification</option>
              <option value="pending_review">Pending Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200/90 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-[#FAFAFA] text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student & Member ID</th>
                  <th className="px-4 py-3 font-semibold">Full KLU ID & Private Contact</th>
                  <th className="px-4 py-3 font-semibold">Academic & Mode</th>
                  <th className="px-4 py-3 font-semibold">Path, Skills & Roadmap</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      No students match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const priv = privateMap[s.uid];
                    const arch = getArchetypeMeta(s.primaryCategory);
                    const roadmapDone = (s.roadmap || []).filter((r) => r.completed).length;
                    return (
                      <tr key={s.uid} className="hover:bg-zinc-50 align-top">
                        <td className="px-4 py-3.5 space-y-1">
                          <p className="font-semibold text-zinc-950">{s.fullName}</p>
                          <p className="font-mono text-[11px] tabular-nums font-semibold text-[#C8102E]">
                            #{s.memberNumber}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Joined {formatFirestoreDate(s.createdAt)}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 space-y-1">
                          <p className="font-mono text-xs font-semibold tabular-nums text-zinc-950">
                            KLU ID: {priv?.kluStudentId || s.maskedStudentId}
                          </p>
                          <p className="text-[11px] text-zinc-700 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{priv?.email || 'Loading email...'}</span>
                          </p>
                          <p className="font-mono text-[11px] tabular-nums text-zinc-700 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>{priv?.phone || '—'}</span>
                            {priv?.gender ? (
                              <span className="text-zinc-500 font-sans">· {priv.gender}</span>
                            ) : null}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 space-y-1 text-zinc-600">
                          <p className="font-semibold text-zinc-950">
                            {s.branch} · {s.year}
                          </p>
                          <p className="font-mono text-[11px] text-zinc-500">{s.batch}</p>
                          <p className="text-[11px] text-zinc-500">
                            Mode: {s.campusMode || 'Unlisted'}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 space-y-1 max-w-xs">
                          <p className="font-semibold" style={{ color: arch.accentHex }}>
                            {arch.subtitle} ({arch.name})
                          </p>
                          <p className="text-[11px] text-zinc-700 truncate">
                            Skills: {s.skills.length > 0 ? s.skills.join(', ') : 'None listed'}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Roadmap: <span className="font-mono">{roadmapDone}/{(s.roadmap || []).length}</span> · Startup: {s.startupInterest ? 'Yes' : 'No'}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`font-semibold ${
                              s.isSuspended
                                ? 'text-red-600'
                                : s.verificationStatus === 'verified'
                                  ? 'text-emerald-700'
                                  : s.verificationStatus === 'rejected'
                                    ? 'text-red-600'
                                    : 'text-amber-700'
                            }`}
                          >
                            {s.isSuspended ? 'Suspended' : s.verificationStatus}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex flex-wrap justify-end items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentUid(s.uid)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700 font-medium hover:bg-blue-100 whitespace-nowrap shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              All Details
                            </button>

                            {s.verificationStatus !== 'verified' && (
                              <button
                                type="button"
                                onClick={() =>
                                  adminSetStudentVerification(adminUid, adminEmail, s.uid, 'verified')
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 font-medium hover:bg-emerald-100 whitespace-nowrap shrink-0"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verify
                              </button>
                            )}
                            {s.verificationStatus === 'pending_review' && (
                              <button
                                type="button"
                                onClick={() =>
                                  adminSetStudentVerification(adminUid, adminEmail, s.uid, 'rejected')
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700 hover:text-red-600 hover:border-red-200 whitespace-nowrap shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                adminSetStudentSuspension(adminUid, adminEmail, s.uid, !s.isSuspended)
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-zinc-700 hover:border-zinc-300 whitespace-nowrap shrink-0"
                            >
                              {s.isSuspended ? (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                                  Restore
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3.5 h-3.5 text-[#C8102E]" />
                                  Suspend
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'opportunities' && (
        <div className="space-y-3">
          {allOpportunities.map((op) => (
            <div
              key={op.id}
              className="rounded-2xl border border-zinc-200/90 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div>
                <p className="text-xs text-zinc-500">
                  {op.category} · {op.organization} · Submitted by {op.submittedByName}
                </p>
                <p className="mt-1 font-display text-base font-semibold text-zinc-950">{op.title}</p>
                <p className="text-xs text-zinc-500">Status: {op.approvalStatus}</p>
              </div>
              <div className="flex items-center gap-2">
                {op.approvalStatus !== 'approved' && (
                  <button
                    type="button"
                    onClick={() =>
                      adminModerateOpportunity(adminUid, adminEmail, op.id, 'approved')
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-[#C8102E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}
                {op.approvalStatus !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() =>
                      adminModerateOpportunity(adminUid, adminEmail, op.id, 'rejected')
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'ideas' && (
        <div className="space-y-3">
          {displayedIdeas.map((idea) => (
            <div
              key={idea.id}
              className="rounded-2xl border border-zinc-200/90 bg-white p-5 flex items-center justify-between gap-4 shadow-xs"
            >
              <div>
                <p className="text-xs text-zinc-500">
                  {idea.authorName} ({idea.authorBranch}) · {idea.stage} · Visibility: {idea.visibility}
                </p>
                <p className="mt-1 font-display text-base font-semibold text-zinc-950">{idea.title}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteIdea(idea.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-xs text-zinc-500">No reports filed.</p>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-2xl border border-zinc-200/90 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <p className="text-xs text-zinc-500">
                    Target: {rep.targetType} ({rep.targetId}) · Status: {rep.status}
                  </p>
                  <p className="mt-1 text-sm text-zinc-800">{rep.reason}</p>
                </div>
                {rep.status === 'open' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => adminResolveReport(adminUid, adminEmail, rep.id, 'resolved')}
                      className="rounded-lg bg-[#C8102E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => adminResolveReport(adminUid, adminEmail, rep.id, 'dismissed')}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 hover:border-zinc-300"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {adminTab === 'logs' && (
        <div className="rounded-2xl border border-zinc-200/90 bg-white divide-y divide-zinc-200 shadow-xs">
          {auditLogs.length === 0 ? (
            <p className="p-5 text-xs text-zinc-500">No administrative actions logged yet.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-mono font-semibold text-[#C8102E]">{log.action}</span>
                  <span className="mx-2 text-zinc-300">·</span>
                  <span className="text-zinc-800">{log.details}</span>
                </div>
                <span className="font-mono text-zinc-500">
                  {log.adminEmail} · target {log.targetId.slice(0, 12)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Full Live Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#C8102E]">
                  Live Student Record · #{selectedStudent.memberNumber}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-zinc-950">
                  {selectedStudent.fullName}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-zinc-500">
                  UID: {selectedStudent.uid}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentUid(null)}
                className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-2 text-zinc-500 hover:text-zinc-950"
                aria-label="Close student details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Moderation Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-4">
              <div className="flex items-center gap-2 text-xs">
                <UserCheck className="w-4 h-4 text-[#C8102E]" />
                <span className="text-zinc-600">
                  Verification:{' '}
                  <strong className="text-zinc-950">{selectedStudent.verificationStatus}</strong>
                </span>
                <span className="mx-1 text-zinc-300">·</span>
                <span className="text-zinc-600">
                  Account:{' '}
                  <strong className={selectedStudent.isSuspended ? 'text-red-600' : 'text-emerald-700'}>
                    {selectedStudent.isSuspended ? 'Suspended' : 'Active'}
                  </strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedStudent.verificationStatus !== 'verified' && (
                  <button
                    type="button"
                    onClick={() =>
                      adminSetStudentVerification(adminUid, adminEmail, selectedStudent.uid, 'verified')
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Approve Verification
                  </button>
                )}
                {selectedStudent.verificationStatus !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() =>
                      adminSetStudentVerification(adminUid, adminEmail, selectedStudent.uid, 'rejected')
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject ID
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    adminSetStudentSuspension(
                      adminUid,
                      adminEmail,
                      selectedStudent.uid,
                      !selectedStudent.isSuspended
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:border-zinc-300"
                >
                  {selectedStudent.isSuspended ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                      Restore Account
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5 text-[#C8102E]" />
                      Suspend Account
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Institutional & Private PII Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Private Identity & Contact (Live)
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Full KLU Student ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-zinc-950">
                        {selectedPrivate?.kluStudentId || 'Loading...'}
                      </span>
                      {selectedPrivate?.kluStudentId && (
                        <button
                          type="button"
                          onClick={() => copyValue('kluId', selectedPrivate.kluStudentId)}
                          className="text-zinc-400 hover:text-zinc-900"
                          title="Copy KLU ID"
                        >
                          {copiedField === 'kluId' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Masked Public ID</span>
                    <span className="font-mono text-zinc-700">{selectedStudent.maskedStudentId}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Verified Email</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-zinc-950 truncate">
                        {selectedPrivate?.email || 'Loading...'}
                      </span>
                      {selectedPrivate?.email && (
                        <button
                          type="button"
                          onClick={() => copyValue('email', selectedPrivate.email)}
                          className="text-zinc-400 hover:text-zinc-900 shrink-0"
                          title="Copy Email"
                        >
                          {copiedField === 'email' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Phone / WhatsApp</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-950">
                        {selectedPrivate?.phone || '—'}
                      </span>
                      {selectedPrivate?.phone && (
                        <button
                          type="button"
                          onClick={() => copyValue('phone', selectedPrivate.phone)}
                          className="text-zinc-400 hover:text-zinc-900"
                          title="Copy Phone"
                        >
                          {copiedField === 'phone' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Gender</span>
                    <span className="text-zinc-800">{selectedPrivate?.gender || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Registered At</span>
                    <span className="font-mono text-zinc-700">
                      {formatFirestoreDate(selectedStudent.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Last Updated</span>
                    <span className="font-mono text-zinc-700">
                      {formatFirestoreDate(selectedStudent.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Academic, Path & Builder Profile
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Branch / Year / Batch</span>
                    <span className="text-zinc-950 font-medium">
                      {selectedStudent.branch} · {selectedStudent.year} ({selectedStudent.batch})
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Campus Mode</span>
                    <span className="text-zinc-800">{selectedStudent.campusMode || 'Unlisted'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Primary Blueprint</span>
                    <span
                      className="font-semibold"
                      style={{ color: getArchetypeMeta(selectedStudent.primaryCategory).accentHex }}
                    >
                      {getArchetypeMeta(selectedStudent.primaryCategory).name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Allow Connections</span>
                    <span className="text-zinc-800">
                      {selectedStudent.allowConnections ? 'Enabled' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">Startup Interest</span>
                    <span className="text-zinc-800">
                      {selectedStudent.startupInterest ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-zinc-200">
                    <p className="text-zinc-500 mb-1">Core Skills</p>
                    <p className="text-zinc-800 leading-relaxed">
                      {selectedStudent.skills.length > 0 ? selectedStudent.skills.join(' · ') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 mb-1">Secondary Interests</p>
                    <p className="text-zinc-800 leading-relaxed">
                      {selectedStudent.secondaryInterests.length > 0
                        ? selectedStudent.secondaryInterests.join(' · ')
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio, Career Goal & Startup Idea */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-4 space-y-1.5">
                <p className="text-xs font-medium text-zinc-500">Career Goal</p>
                <p className="text-xs leading-relaxed text-zinc-800">
                  {selectedStudent.careerGoal || 'Not specified'}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-4 space-y-1.5">
                <p className="text-xs font-medium text-zinc-500">Student Bio</p>
                <p className="text-xs leading-relaxed text-zinc-800">
                  {selectedStudent.bio || 'No bio added'}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-4 space-y-1.5">
                <p className="text-xs font-medium text-zinc-500">Startup Idea Summary</p>
                <p className="text-xs leading-relaxed text-zinc-800">
                  {selectedStudent.startupIdeaSummary || 'No startup summary'}
                </p>
              </div>
            </div>

            {/* Live 4-Year Roadmap Progress */}
            <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                4-Year Roadmap Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(selectedStudent.roadmap || []).map((step) => (
                  <div
                    key={step.year}
                    className={`rounded-xl border p-3.5 space-y-1.5 ${
                      step.completed
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-zinc-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-950">{step.label}</span>
                      <span className={step.completed ? 'font-semibold text-emerald-700' : 'text-zinc-500'}>
                        {step.completed ? 'Done' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">{step.goal}</p>
                    {step.notes && (
                      <p className="text-[11px] text-zinc-500 border-t border-zinc-200 pt-1.5">
                        Note: {step.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Tribe Pass Card Render */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Live Tribe Pass Preview
              </p>
              <TribePassCard student={selectedStudent} compact showActions={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
