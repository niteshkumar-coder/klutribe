import { useState, type FormEvent } from 'react';
import { ArrowLeftRight, CheckCircle2, Plus, UserPlus, X } from 'lucide-react';
import {
  createSkillExchange,
  sendConnectionRequest,
  updateSkillExchangeStatus,
} from '../lib/kluService';
import {
  CURATED_SKILLS,
  type Connection,
  type SkillExchange,
  type StudentPublic,
} from '../types/klu';

interface SkillExchangeViewProps {
  me: StudentPublic;
  exchanges: SkillExchange[];
  students: StudentPublic[];
  connections: Connection[];
}

export function SkillExchangeView({
  me,
  exchanges,
  students,
  connections,
}: SkillExchangeViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [teachSkill, setTeachSkill] = useState('Java');
  const [learnSkill, setLearnSkill] = useState('Python');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSkillExchange({
        authorUid: me.uid,
        authorName: me.fullName,
        authorBranch: me.branch,
        teachSkill,
        learnSkill,
        note,
      });
      setNote('');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = exchanges.filter((ex) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${ex.teachSkill} ${ex.learnSkill} ${ex.authorName} ${ex.note}`.toLowerCase().includes(q);
  });

  const handleConnectAuthor = async (authorUid: string, authorName: string) => {
    const peer = students.find((s) => s.uid === authorUid);
    if (!peer) return;
    await sendConnectionRequest(me, peer, `Hi ${authorName.split(' ')[0]}, interested in your Skill Exchange post!`);
    setFeedback(`Connection request sent to ${authorName}.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">Skill Exchange</h1>
          <p className="text-sm text-zinc-600">
            Trade what you already know for skills you want to learn—peer-to-peer across KL University.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Offer Skill Swap
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills (e.g. Python, UI/UX, Video Editing, Java)..."
          className="w-full sm:max-w-md rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
        />
        <span className="font-mono text-xs tabular-nums text-zinc-500">
          {filtered.length} active exchanges
        </span>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {feedback}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-10 text-center space-y-2 shadow-xs">
          <ArrowLeftRight className="w-5 h-5 text-[#C8102E] mx-auto" />
          <p className="text-sm font-medium text-zinc-950">No skill exchange listings yet</p>
          <p className="text-xs text-zinc-500">
            Create the first swap (e.g. Java Developer → wants to learn Python).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ex) => {
            const isMine = ex.authorUid === me.uid;
            const connected = connections.some((c) => c.participantUids.includes(ex.authorUid));
            return (
              <div
                key={ex.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      {ex.authorName} · {ex.authorBranch}
                    </span>
                    <span className={ex.status === 'matched' ? 'font-semibold text-blue-700' : 'font-semibold text-emerald-700'}>
                      {ex.status === 'matched' ? 'Matched' : 'Open'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-3.5 space-y-2">
                    <div>
                      <p className="text-[11px] text-zinc-500">Can Teach</p>
                      <p className="text-sm font-semibold text-emerald-700">{ex.teachSkill}</p>
                    </div>
                    <div className="border-t border-zinc-200 pt-2">
                      <p className="text-[11px] text-zinc-500">Wants to Learn</p>
                      <p className="text-sm font-semibold text-[#C8102E]">{ex.learnSkill}</p>
                    </div>
                  </div>

                  {ex.note && <p className="text-xs text-zinc-600 leading-relaxed">{ex.note}</p>}
                </div>

                <div className="border-t border-zinc-200 pt-3 flex items-center justify-between">
                  {isMine ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() =>
                          updateSkillExchangeStatus(ex.id, ex.status === 'open' ? 'matched' : 'closed')
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-[#FAFAFA] px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {ex.status === 'open' ? 'Mark Matched' : 'Close Listing'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={connected}
                      onClick={() => handleConnectAuthor(ex.authorUid, ex.authorName)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8102E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#A30D25] disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {connected ? 'Connected / Pending' : 'Connect to Swap'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-zinc-950">Post Skill Exchange</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Skill I Can Teach *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={60}
                list="klu-skills-list"
                value={teachSkill}
                onChange={(e) => setTeachSkill(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Skill I Want to Learn *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={60}
                list="klu-skills-list"
                value={learnSkill}
                onChange={(e) => setLearnSkill(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <datalist id="klu-skills-list">
              {CURATED_SKILLS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Availability / Note</label>
              <textarea
                rows={3}
                maxLength={300}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Available evenings after 5 PM near R&D Block or online."
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#C8102E] py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
            >
              {submitting ? 'Publishing...' : 'Publish Skill Swap'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
