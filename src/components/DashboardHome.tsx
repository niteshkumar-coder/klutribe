import { useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  Crown,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { sendConnectionRequest, updateStudentProfile } from '../lib/kluService';
import {
  getArchetypeMeta,
  type CampusEvent,
  type Connection,
  type RoadmapYear,
  type StudentPublic,
} from '../types/klu';
import kluDaylightCampusImg from '../assets/images/klu_daylight_campus_1794679733683.jpg';

interface DashboardHomeProps {
  me: StudentPublic;
  allStudents: StudentPublic[];
  connections: Connection[];
  events: CampusEvent[];
  onNavigate: (tab: string) => void;
}

export function DashboardHome({
  me,
  allStudents,
  connections,
  events,
  onNavigate,
}: DashboardHomeProps) {
  const [roadmap, setRoadmap] = useState<RoadmapYear[]>(me.roadmap);
  const [savingRoadmap, setSavingRoadmap] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [connectingUid, setConnectingUid] = useState<string | null>(null);

  const archetype = getArchetypeMeta(me.primaryCategory);
  const acceptedCount = connections.filter((c) => c.status === 'accepted').length;
  const pendingIncoming = connections.filter((c) => c.status === 'pending' && c.toUid === me.uid);
  const myEventsCount = events.filter((ev) => ev.attendeeUids.includes(me.uid)).length;
  const completedYears = roadmap.filter((r) => r.completed).length;

  const initials =
    me.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'KL';

  const connectedOrPendingUids = new Set(
    connections.flatMap((c) => c.participantUids)
  );

  // Recommend peers based on shared skills, branch, or startup interest
  const recommendedPeers = allStudents
    .filter((s) => s.uid !== me.uid && s.allowConnections && !connectedOrPendingUids.has(s.uid))
    .map((s) => {
      const sharedSkills = s.skills.filter((sk) => me.skills.includes(sk)).length;
      const sameBranch = s.branch === me.branch ? 1 : 0;
      const startupBonus = me.startupInterest && s.startupInterest ? 2 : 0;
      return { student: s, score: sharedSkills * 2 + sameBranch + startupBonus };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const upcomingEvents = events.slice(0, 2);

  const handleToggleYearDone = async (idx: number) => {
    const next = roadmap.map((item, i) =>
      i === idx ? { ...item, completed: !item.completed } : item
    );
    setRoadmap(next);
    setSavingRoadmap(true);
    try {
      await updateStudentProfile(me.uid, { roadmap: next });
      setSavedNotice('4-Year Progress saved.');
      setTimeout(() => setSavedNotice(null), 2000);
    } finally {
      setSavingRoadmap(false);
    }
  };

  const handleGoalChange = (idx: number, goal: string) => {
    setRoadmap((prev) => prev.map((item, i) => (i === idx ? { ...item, goal } : item)));
  };

  const handleSaveRoadmapGoals = async () => {
    setSavingRoadmap(true);
    try {
      await updateStudentProfile(me.uid, { roadmap });
      setSavedNotice('Roadmap goals updated.');
      setTimeout(() => setSavedNotice(null), 2500);
    } finally {
      setSavingRoadmap(false);
    }
  };

  const handleQuickConnect = async (peer: StudentPublic) => {
    setConnectingUid(peer.uid);
    try {
      await sendConnectionRequest(me, peer, `Hi ${peer.fullName.split(' ')[0]}, connecting from KLU TRIBE!`);
    } finally {
      setConnectingUid(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card with KL University Daylight Campus Backdrop */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[64%] overflow-hidden">
          <img
            src={kluDaylightCampusImg}
            alt="KL University campus"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 via-30% to-transparent sm:via-white/75 sm:via-25%" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full border-2 border-white bg-gradient-to-br from-[#C8102E] to-[#881337] flex items-center justify-center font-display text-lg font-bold text-white shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">Welcome back,</p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                {me.fullName}
              </h1>
              <p className="mt-0.5 text-xs text-zinc-600">
                B.Tech — {me.branch} <span className="mx-1.5 text-zinc-400">|</span> {me.year}{' '}
                <span className="mx-1.5 text-zinc-400">·</span>{' '}
                <span className="font-semibold" style={{ color: archetype.accentHex }}>
                  {archetype.name}
                </span>
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {me.verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                KLU ID Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Clock className="w-3.5 h-3.5" />
                Pending ID Review
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4 KPI Stat Cards (Matching Reference Dashboard Strip) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('network')}
          className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-4 flex items-center gap-3.5 text-left hover:border-zinc-300 transition-colors"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#C8102E] shrink-0">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500">Connections</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-950">{acceptedCount}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('network')}
          className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-4 flex items-center gap-3.5 text-left hover:border-zinc-300 transition-colors"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#C8102E] shrink-0">
            <UserPlus className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500">Pending Requests</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-950">{pendingIncoming.length}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('campus')}
          className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-4 flex items-center gap-3.5 text-left hover:border-zinc-300 transition-colors"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#C8102E] shrink-0">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500">Campus Activities</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-950">{myEventsCount}</p>
          </div>
        </button>

        <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-4 flex items-center gap-3.5">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs text-zinc-500">4-Year Milestones</p>
            <p className="font-mono text-2xl font-bold tabular-nums text-zinc-950">{completedYears}/4</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upcoming Campus Events + 4-Year Progress Tracker */}
        <div className="xl:col-span-7 space-y-6">
          {/* Upcoming Events */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-zinc-950">Upcoming Campus Events</h2>
              <button
                type="button"
                onClick={() => onNavigate('campus')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#C8102E] hover:text-[#A30D25]"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-[#F8F9FA] p-4 flex items-center justify-between gap-4">
                <p className="text-xs text-zinc-600">
                  No campus events posted yet. Share a Samyak, Surabhi, or club session.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('campus')}
                  className="text-xs font-semibold text-[#C8102E] whitespace-nowrap shrink-0"
                >
                  Open Campus Life
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-zinc-950 truncate">{ev.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {ev.dateLabel} · {ev.venue}
                      </p>
                    </div>
                    <span className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-[#C8102E] whitespace-nowrap shrink-0">
                      {ev.section}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4-Year Progress Tracker */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-zinc-950">Your 4-Year Progress Tracker</h2>
                <p className="text-xs text-zinc-500">
                  Track annual B.Tech objectives across all four years at KL University.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveRoadmapGoals}
                disabled={savingRoadmap}
                className="rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {savingRoadmap ? 'Saving...' : 'Save Milestones'}
              </button>
            </div>

            {savedNotice && <p className="text-xs font-medium text-emerald-700">{savedNotice}</p>}

            <div className="space-y-2.5">
              {roadmap.map((item, idx) => (
                <div
                  key={item.year}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-zinc-200 bg-[#FAFAFA] p-3.5"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleYearDone(idx)}
                    className="inline-flex items-center gap-2.5 text-left shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-400 hover:text-[#C8102E]" />
                    )}
                    <span className="font-mono text-xs font-semibold tabular-nums text-zinc-700 w-14">
                      {item.label}
                    </span>
                  </button>
                  <input
                    type="text"
                    maxLength={140}
                    value={item.goal}
                    onChange={(e) => handleGoalChange(idx, e.target.value)}
                    className={`flex-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-[#C8102E] pb-0.5 ${
                      item.completed ? 'text-zinc-400 line-through' : 'text-zinc-900'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Gold Compact Tribe Pass Widget + Recommended Peers */}
        <aside className="xl:col-span-5 space-y-6">
          {/* Compact Gold/Crimson Tribe Pass Card (Matching Reference Bottom-Right Widget) */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-zinc-950">Your Tribe Pass</h2>

            <div className="relative overflow-hidden rounded-2xl border border-amber-300/80 bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#F59E0B]/80 p-5 text-zinc-950 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Crown className="w-4 h-4 text-amber-700" />
                    KLU TRIBE
                  </span>
                  <p className="font-display text-lg font-bold text-zinc-950">
                    {me.verificationStatus === 'verified' ? 'Verified Member' : 'Tribe Member'}
                  </p>
                  <p className="font-mono text-xs font-semibold text-amber-950/80">
                    #{me.memberNumber} · {me.maskedStudentId}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-1.5 shadow-xs text-[10px] font-mono font-bold text-zinc-900">
                  {me.branch} · {me.year.split(' ')[0]}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('pass')}
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#C8102E] hover:text-[#A30D25] transition-colors"
            >
              View Pass
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recommended Peers */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-zinc-950">Recommended Peers</h2>
              <button
                type="button"
                onClick={() => onNavigate('network')}
                className="text-xs font-semibold text-[#C8102E] hover:text-[#A30D25]"
              >
                Browse All
              </button>
            </div>

            {recommendedPeers.length === 0 ? (
              <p className="text-xs leading-relaxed text-zinc-500">
                No new peer recommendations right now. As more KL University students join, matching peers by branch and skills will appear here.
              </p>
            ) : (
              <div className="divide-y divide-zinc-200">
                {recommendedPeers.map(({ student }) => {
                  const peerArch = getArchetypeMeta(student.primaryCategory);
                  return (
                    <div key={student.uid} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-zinc-950 truncate">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {student.branch} · {student.year} ·{' '}
                            <span style={{ color: peerArch.accentHex }}>{peerArch.subtitle}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickConnect(student)}
                          disabled={connectingUid === student.uid}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-800 hover:border-[#C8102E] hover:text-[#C8102E] transition-colors shrink-0"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {connectingUid === student.uid ? 'Sending...' : 'Connect'}
                        </button>
                      </div>
                      {student.skills.length > 0 && (
                        <p className="text-xs text-zinc-500 truncate">
                          {student.skills.slice(0, 3).join(' · ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Career Direction */}
          <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
              <Sparkles className="w-4 h-4 text-[#C8102E]" />
              Active Career Direction
            </div>
            <p className="text-sm text-zinc-800 leading-relaxed">
              {me.careerGoal || 'Set your 4-year career goal in Settings to align recommendations.'}
            </p>
          </div>
        </aside>
      </div>

      {/* Bottom 4-Tile Strip: Recommended for You (Matching Reference Dashboard Bottom) */}
      <div className="space-y-3">
        <h2 className="font-display text-base font-bold text-zinc-950">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('campus')}
            className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-4 flex items-center gap-3 text-left hover:border-[#C8102E]/40 transition-colors"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#C8102E] shrink-0">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-zinc-950">Join Campus Life</p>
              <p className="text-[11px] text-zinc-500">Samyak, Surabhi & clubs</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-4 flex items-center gap-3 text-left hover:border-[#C8102E]/40 transition-colors"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#C8102E] shrink-0">
              <Code2 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-zinc-950">Find a Project</p>
              <p className="text-[11px] text-zinc-500">Collaborate & build teams</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('opportunities')}
            className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-4 flex items-center gap-3 text-left hover:border-[#C8102E]/40 transition-colors"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#C8102E] shrink-0">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-zinc-950">Explore Opportunities</p>
              <p className="text-[11px] text-zinc-500">Internships, jobs & contests</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('ideas')}
            className="rounded-2xl border border-zinc-200/90 bg-white shadow-xs p-4 flex items-center gap-3 text-left hover:border-[#C8102E]/40 transition-colors"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#C8102E] shrink-0">
              <Lightbulb className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-zinc-950">Pitch Startup Ideas</p>
              <p className="text-[11px] text-zinc-500">Find campus co-founders</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
