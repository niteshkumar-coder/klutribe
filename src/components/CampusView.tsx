import { useState, type FormEvent } from 'react';
import { Calendar, Check, MapPin, Plus, X } from 'lucide-react';
import { createCampusEvent, toggleEventAttendance } from '../lib/kluService';
import {
  CAMPUS_SECTIONS,
  type CampusEvent,
  type CampusSection,
  type StudentPublic,
} from '../types/klu';
import campusInnovationHubImg from '../assets/images/campus_innovation_hub_1794551685319.jpg';

interface CampusViewProps {
  me: StudentPublic;
  events: CampusEvent[];
}

export function CampusView({ me, events }: CampusViewProps) {
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [section, setSection] = useState<CampusSection>('Clubs');
  const [dateLabel, setDateLabel] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createCampusEvent({
        createdByUid: me.uid,
        title,
        section,
        dateLabel,
        venue,
        description,
      });
      setTitle('');
      setDateLabel('');
      setVenue('');
      setDescription('');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = events.filter((ev) =>
    sectionFilter === 'ALL' ? true : ev.section === sectionFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">Campus Community</h1>
          <p className="text-sm text-zinc-600">
            Samyak, Surabhi, technical clubs, athletics, student achievements, and weekend activities at KL University.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Post Activity
        </button>
      </div>

      {/* Campus Architectural Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 min-h-[220px] shadow-xs">
          <img
            src={campusInnovationHubImg}
            alt="University engineering makerspace and startup workbench"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-xs text-rose-300 font-semibold">KL University · Vaddeswaram</p>
            <h2 className="mt-1 font-display text-xl font-bold text-white">
              Makerspaces, Annual Fests & Student Clubs
            </h2>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/90 bg-white p-6 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500">My Participation</p>
            <p className="font-mono text-3xl font-bold tabular-nums text-zinc-950">
              {events.filter((e) => e.attendeeUids.includes(me.uid)).length}
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Mark events you are attending or participating in to track your campus involvement across Samyak, Surabhi, and club sessions.
            </p>
          </div>
          <p className="text-[11px] text-zinc-500 border-t border-zinc-200 pt-3">
            Authentic campus & student-contributed updates only.
          </p>
        </div>
      </div>

      {/* Section Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSectionFilter('ALL')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            sectionFilter === 'ALL'
              ? 'bg-[#C8102E] text-white shadow-xs'
              : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
          }`}
        >
          All Sections
        </button>
        {CAMPUS_SECTIONS.map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => setSectionFilter(sec)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sectionFilter === sec
                ? 'bg-[#C8102E] text-white shadow-xs'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-10 text-center space-y-2 shadow-xs">
          <Calendar className="w-5 h-5 text-[#C8102E] mx-auto" />
          <p className="text-sm font-medium text-zinc-950">No activities listed in this section yet</p>
          <p className="text-xs text-zinc-500">
            Post a club meetup, Samyak workshop, sports trial, or weekend session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ev) => {
            const attending = ev.attendeeUids.includes(me.uid);
            return (
              <div
                key={ev.id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#C8102E]">{ev.section}</span>
                    <span className="font-mono text-zinc-500">{ev.dateLabel}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-zinc-950">
                    {ev.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-600">{ev.description}</p>
                  <p className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {ev.venue}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 pt-3.5">
                  <span className="font-mono text-xs tabular-nums text-zinc-500">
                    {ev.attendeeUids.length} attending
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleEventAttendance(ev, me.uid)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      attending
                        ? 'border border-rose-200 bg-rose-50 text-[#C8102E]'
                        : 'bg-[#C8102E] text-white font-semibold hover:bg-[#A30D25]'
                    }`}
                  >
                    {attending && <Check className="w-3.5 h-3.5" />}
                    {attending ? 'Attending' : 'Count Me In'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-zinc-950">Post Campus Activity</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Activity Title *</label>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as CampusSection)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
                >
                  {CAMPUS_SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Date & Time *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={60}
                  value={dateLabel}
                  onChange={(e) => setDateLabel(e.target.value)}
                  placeholder="e.g. Fri 4:30 PM"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Campus Venue *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. R&D Block Seminar Hall / Jasmine Hall"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Description *</label>
              <textarea
                required
                minLength={10}
                maxLength={600}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#C8102E] py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
            >
              {submitting ? 'Publishing...' : 'Publish Campus Activity'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
