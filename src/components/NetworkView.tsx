import { useEffect, useState, type FormEvent } from 'react';
import {
  Check,
  Flag,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  createContentReport,
  respondConnectionRequest,
  sendConnectionRequest,
  sendDirectMessage,
  subscribeConnectionMessages,
} from '../lib/kluService';
import {
  ACADEMIC_YEARS,
  ARCHETYPES,
  BRANCHES,
  getArchetypeMeta,
  type Connection,
  type DirectMessage,
  type StudentPublic,
} from '../types/klu';
import { StudentAvatar } from './StudentAvatar';

interface NetworkViewProps {
  me: StudentPublic;
  students: StudentPublic[];
  connections: Connection[];
}

export function NetworkView({ me, students, connections }: NetworkViewProps) {
  const [tab, setTab] = useState<'discover' | 'requests' | 'messages'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [campusFilter, setCampusFilter] = useState<string>('ALL');
  const [startupOnly, setStartupOnly] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<StudentPublic | null>(null);
  const [connectNote, setConnectNote] = useState('');
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const [activeChatConnId, setActiveChatConnId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const [reportingUid, setReportingUid] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const acceptedConnections = connections.filter((c) => c.status === 'accepted');
  const incomingRequests = connections.filter((c) => c.status === 'pending' && c.toUid === me.uid);
  const outgoingRequests = connections.filter((c) => c.status === 'pending' && c.fromUid === me.uid);

  useEffect(() => {
    if (!activeChatConnId) {
      setMessages([]);
      return;
    }
    const unsub = subscribeConnectionMessages(activeChatConnId, setMessages);
    return () => unsub();
  }, [activeChatConnId]);

  const getConnectionForPeer = (peerUid: string): Connection | undefined =>
    connections.find((c) => c.participantUids.includes(peerUid));

  const filteredStudents = students.filter((s) => {
    if (s.uid === me.uid) return false;
    if (branchFilter !== 'ALL' && s.branch !== branchFilter) return false;
    if (yearFilter !== 'ALL' && s.year !== yearFilter) return false;
    if (categoryFilter !== 'ALL' && s.primaryCategory !== categoryFilter) return false;
    if (campusFilter !== 'ALL' && s.campusMode !== campusFilter) return false;
    if (startupOnly && !s.startupInterest) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hay = `${s.fullName} ${s.branch} ${s.skills.join(' ')} ${s.bio} ${s.careerGoal}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const handleConnect = async (peer: StudentPublic) => {
    setSendingTo(peer.uid);
    try {
      await sendConnectionRequest(me, peer, connectNote || 'Let us connect on KLU TRIBE.');
      setConnectNote('');
      setSelectedStudent(null);
      setFeedback(`Connection request sent to ${peer.fullName}.`);
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSendingTo(null);
    }
  };

  const handleSendMsg = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeChatConnId || !messageDraft.trim()) return;
    setSendingMsg(true);
    try {
      await sendDirectMessage(activeChatConnId, me.uid, me.fullName, messageDraft);
      setMessageDraft('');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleReportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reportingUid || reportReason.trim().length < 5) return;
    await createContentReport({
      reporterUid: me.uid,
      targetType: 'student',
      targetId: reportingUid,
      reason: reportReason,
    });
    setReportingUid(null);
    setReportReason('');
    setFeedback('Report submitted to moderators.');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">Tribe Network</h1>
          <p className="text-sm text-zinc-600">
            Discover B.Tech peers across branches. Phone numbers, emails, and full IDs remain strictly private.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="inline-flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setTab('discover')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              tab === 'discover' ? 'bg-[#C8102E] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Discover ({filteredStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('requests')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              tab === 'requests' ? 'bg-[#C8102E] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Requests ({incomingRequests.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('messages')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              tab === 'messages' ? 'bg-[#C8102E] text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Messages ({acceptedConnections.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {feedback}
        </div>
      )}

      {tab === 'discover' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 shadow-xs">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, skill, or bio..."
                className="w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

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
              <option value="ALL">All Archetypes</option>
              {ARCHETYPES.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>

            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              <option value="ALL">Campus Mode (Opt-in)</option>
              <option value="Hosteller">Hosteller</option>
              <option value="Day Scholar">Day Scholar</option>
            </select>

            <label className="lg:col-span-6 flex items-center gap-2 text-xs text-zinc-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={startupOnly}
                onChange={(e) => setStartupOnly(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#C8102E]"
              />
              Show students interested in Startups & Co-founding only
            </label>
          </div>

          {/* Directory Grid */}
          {filteredStudents.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-8 text-center space-y-2 shadow-xs">
              <p className="font-medium text-sm text-zinc-950">No matching students found</p>
              <p className="text-xs text-zinc-500">
                Try clearing filters or invite classmates from KL University to join KLU TRIBE.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((student) => {
                const arch = getArchetypeMeta(student.primaryCategory);
                const conn = getConnectionForPeer(student.uid);
                return (
                  <div
                    key={student.uid}
                    className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 space-y-4 shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <StudentAvatar
                            name={student.fullName}
                            avatarDataUrl={student.avatarDataUrl}
                            size="md"
                            shape="rounded"
                            className="border border-zinc-200 shadow-xs"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-display text-base font-semibold text-zinc-950 truncate">
                                {student.fullName}
                              </h3>
                              {student.verificationStatus === 'verified' && (
                                <ShieldCheck className="w-4 h-4 text-[#C8102E] shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">
                              {student.branch} · {student.year}
                              {student.campusMode ? ` · ${student.campusMode}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400 shrink-0">
                          #{student.memberNumber}
                        </span>
                      </div>

                      <p className="text-xs font-semibold" style={{ color: arch.accentHex }}>
                        {arch.name}
                      </p>

                      {student.bio && (
                        <p className="text-xs leading-relaxed text-zinc-600 line-clamp-2">
                          {student.bio}
                        </p>
                      )}

                      {student.skills.length > 0 && (
                        <p className="text-xs text-zinc-500">
                          {student.skills.slice(0, 4).join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-zinc-200 pt-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
                      >
                        View Profile
                      </button>

                      {conn?.status === 'accepted' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveChatConnId(conn.id);
                            setTab('messages');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-[#C8102E] hover:bg-rose-100 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                        </button>
                      ) : conn?.status === 'pending' ? (
                        <span className="text-xs text-zinc-500">
                          {conn.fromUid === me.uid ? 'Request Sent' : 'Pending Your Reply'}
                        </span>
                      ) : student.allowConnections ? (
                        <button
                          type="button"
                          onClick={() => handleConnect(student)}
                          disabled={sendingTo === student.uid}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8102E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#A30D25] transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Connect
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400">Connections Closed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 space-y-4 shadow-xs">
            <h2 className="font-display text-base font-semibold text-zinc-950">Incoming Requests</h2>
            {incomingRequests.length === 0 ? (
              <p className="text-xs text-zinc-500">No pending connection requests.</p>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-950">{req.fromName}</p>
                      {req.note && <p className="mt-0.5 text-xs text-zinc-600">{req.note}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => respondConnectionRequest(req.id, 'accepted')}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#C8102E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => respondConnectionRequest(req.id, 'declined')}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 space-y-4 shadow-xs">
            <h2 className="font-display text-base font-semibold text-zinc-950">Sent Requests</h2>
            {outgoingRequests.length === 0 ? (
              <p className="text-xs text-zinc-500">No outgoing pending requests.</p>
            ) : (
              <div className="space-y-3">
                {outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-950">{req.toName}</p>
                      <p className="text-xs text-zinc-500">Awaiting acceptance</p>
                    </div>
                    <span className="text-xs font-medium text-amber-700">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-zinc-200/90 bg-white overflow-hidden min-h-[420px] shadow-xs">
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-zinc-200 bg-[#FAFAFA] p-4 space-y-2">
            <p className="text-xs font-medium text-zinc-500 px-2 pb-2">
              Mutual Connections
            </p>
            {acceptedConnections.length === 0 ? (
              <p className="px-2 text-xs text-zinc-500">
                Messaging unlocks once a peer accepts your connection request.
              </p>
            ) : (
              acceptedConnections.map((conn) => {
                const peerName = conn.fromUid === me.uid ? conn.toName : conn.fromName;
                return (
                  <button
                    key={conn.id}
                    type="button"
                    onClick={() => setActiveChatConnId(conn.id)}
                    className={`w-full text-left rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                      activeChatConnId === conn.id
                        ? 'bg-rose-50 text-[#C8102E] font-medium border border-rose-200'
                        : 'text-zinc-700 hover:bg-white hover:text-zinc-950'
                    }`}
                  >
                    {peerName}
                  </button>
                );
              })
            )}
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between p-5 bg-white">
            {!activeChatConnId ? (
              <div className="m-auto text-center space-y-1.5">
                <p className="text-sm font-medium text-zinc-900">Select a mutual connection</p>
                <p className="text-xs text-zinc-500">
                  Direct messages are protected by mutual-consent rules.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1">
                  {messages.length === 0 ? (
                    <p className="text-xs text-zinc-500">No messages yet. Say hello!</p>
                  ) : (
                    messages.map((m) => {
                      const mine = m.senderUid === me.uid;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                              mine
                                ? 'bg-[#C8102E] text-white font-medium'
                                : 'border border-zinc-200 bg-[#FAFAFA] text-zinc-800'
                            }`}
                          >
                            {m.body}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendMsg} className="mt-4 flex items-center gap-2 border-t border-zinc-200 pt-3">
                  <input
                    type="text"
                    maxLength={1000}
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !messageDraft.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25] disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <StudentAvatar
                  name={selectedStudent.fullName}
                  avatarDataUrl={selectedStudent.avatarDataUrl}
                  size="lg"
                  shape="rounded"
                  className="border border-zinc-200 shadow-xs"
                />
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold text-zinc-950 truncate">
                    {selectedStudent.fullName}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    B.Tech {selectedStudent.branch} · {selectedStudent.year} · #{selectedStudent.memberNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-700">
              <p className="text-xs font-semibold" style={{ color: getArchetypeMeta(selectedStudent.primaryCategory).accentHex }}>
                {getArchetypeMeta(selectedStudent.primaryCategory).name}
              </p>
              {selectedStudent.bio && <p className="leading-relaxed">{selectedStudent.bio}</p>}
              {selectedStudent.careerGoal && (
                <p className="text-xs text-zinc-500">
                  Goal: <span className="text-zinc-900">{selectedStudent.careerGoal}</span>
                </p>
              )}
              {selectedStudent.skills.length > 0 && (
                <p className="text-xs text-zinc-500">
                  Skills: <span className="text-zinc-900">{selectedStudent.skills.join(' · ')}</span>
                </p>
              )}
              {selectedStudent.secondaryInterests.length > 0 && (
                <p className="text-xs text-zinc-500">
                  Interests: <span className="text-zinc-900">{selectedStudent.secondaryInterests.join(' · ')}</span>
                </p>
              )}
            </div>

            {!getConnectionForPeer(selectedStudent.uid) && selectedStudent.allowConnections && (
              <div className="space-y-2 border-t border-zinc-200 pt-4">
                <input
                  type="text"
                  maxLength={240}
                  value={connectNote}
                  onChange={(e) => setConnectNote(e.target.value)}
                  placeholder="Optional intro note..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleConnect(selectedStudent)}
                  disabled={sendingTo === selectedStudent.uid}
                  className="w-full rounded-xl bg-[#C8102E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
                >
                  Send Connection Request
                </button>
              </div>
            )}

            <div className="flex justify-end border-t border-zinc-200 pt-3">
              <button
                type="button"
                onClick={() => {
                  setReportingUid(selectedStudent.uid);
                  setSelectedStudent(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#C8102E]"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleReportSubmit}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-zinc-950">Report Student Profile</h3>
              <button type="button" onClick={() => setReportingUid(null)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              required
              minLength={5}
              maxLength={400}
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe impersonation, spam, or policy violation..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#C8102E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
            >
              Submit Report
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
