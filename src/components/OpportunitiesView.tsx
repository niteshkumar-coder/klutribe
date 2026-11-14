import { useState, type FormEvent } from 'react';
import { Briefcase, ExternalLink, Flag, Plus, X } from 'lucide-react';
import { createContentReport, submitOpportunity } from '../lib/kluService';
import {
  OPPORTUNITY_CATEGORIES,
  type Opportunity,
  type OpportunityCategory,
  type StudentPublic,
} from '../types/klu';

interface OpportunitiesViewProps {
  me: StudentPublic;
  isAdmin: boolean;
  opportunities: Opportunity[];
  mySubmissions: Opportunity[];
}

export function OpportunitiesView({
  me,
  isAdmin,
  opportunities,
  mySubmissions,
}: OpportunitiesViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [category, setCategory] = useState<OpportunityCategory>('Internship');
  const [source, setSource] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitOpportunity({
        submittedByUid: me.uid,
        submittedByName: me.fullName,
        title,
        organization,
        category,
        source,
        eligibility,
        deadline,
        applyUrl,
        autoApprove: isAdmin,
      });
      setTitle('');
      setOrganization('');
      setSource('');
      setEligibility('');
      setDeadline('');
      setApplyUrl('');
      setShowForm(false);
      setFeedback(
        isAdmin
          ? 'Opportunity published directly.'
          : 'Submitted for admin approval to keep listings authentic.'
      );
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!reportingId || reportReason.trim().length < 5) return;
    await createContentReport({
      reporterUid: me.uid,
      targetType: 'opportunity',
      targetId: reportingId,
      reason: reportReason,
    });
    setReportingId(null);
    setReportReason('');
    setFeedback('Listing reported for moderator review.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const filtered = opportunities.filter((op) =>
    categoryFilter === 'ALL' ? true : op.category === categoryFilter
  );

  const pendingMine = mySubmissions.filter((op) => op.approvalStatus === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">Opportunities</h1>
          <p className="text-sm text-zinc-600">
            Verified internships, hackathons, scholarships, and startup programs with official links and deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Submit Opportunity
        </button>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {feedback}
        </div>
      )}

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter('ALL')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            categoryFilter === 'ALL'
              ? 'bg-[#C8102E] text-white shadow-xs'
              : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
          }`}
        >
          All
        </button>
        {OPPORTUNITY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {pendingMine.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-800">
            Your Pending Submissions ({pendingMine.length})
          </p>
          <div className="space-y-1 text-xs text-amber-700">
            {pendingMine.map((op) => (
              <p key={op.id}>
                {op.title} — {op.organization} (Awaiting Admin Review)
              </p>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-10 text-center space-y-2 shadow-xs">
          <Briefcase className="w-5 h-5 text-[#C8102E] mx-auto" />
          <p className="text-sm font-medium text-zinc-950">No approved opportunities in this category yet</p>
          <p className="text-xs text-zinc-500">
            Submit an official internship, hackathon, or scholarship link for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((op) => (
            <div
              key={op.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#C8102E] font-semibold">
                      {op.category} · {op.organization}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-semibold text-zinc-950">
                      {op.title}
                    </h2>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-zinc-500 shrink-0">
                    Due {op.deadline}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-zinc-200 pt-3 text-xs">
                  <div>
                    <p className="text-zinc-500">Source</p>
                    <p className="mt-0.5 text-zinc-800">{op.source}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Eligibility</p>
                    <p className="mt-0.5 text-zinc-800">{op.eligibility}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-3.5">
                <button
                  type="button"
                  onClick={() => setReportingId(op.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#C8102E] transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report Fake / Broken
                </button>

                <a
                  href={op.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] transition-colors"
                >
                  Official Link
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Opportunity Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6 space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-zinc-950">Submit Verified Opportunity</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Role / Program Title *</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Organization *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as OpportunityCategory)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
                >
                  {OPPORTUNITY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Deadline *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={60}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. 30 Nov 2026"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Source *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Official Careers Portal"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Eligibility *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={160}
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. B.Tech 2nd–4th Year CSE/AI&DS"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Official Application Link *</label>
              <input
                type="url"
                required
                maxLength={300}
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#C8102E] py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
            >
              {submitting ? 'Submitting...' : isAdmin ? 'Publish Opportunity' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      )}

      {/* Report Modal */}
      {reportingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleReport}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-zinc-950">Report Opportunity</h3>
              <button type="button" onClick={() => setReportingId(null)} className="text-zinc-400 hover:text-zinc-900">
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
              placeholder="Explain why this listing looks suspicious, expired, or fake..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#C8102E] py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
            >
              Submit Report
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
