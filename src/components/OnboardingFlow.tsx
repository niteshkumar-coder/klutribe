import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldAlert,
  Briefcase,
  Rocket,
  GraduationCap,
  Code2,
  Compass,
} from 'lucide-react';
import { createStudentAccount } from '../lib/kluService';
import {
  ACADEMIC_YEARS,
  ARCHETYPES,
  BRANCHES,
  CURATED_SKILLS,
  DEFAULT_ROADMAP,
  SECONDARY_INTERESTS,
  type AcademicYear,
  type ArchetypeId,
  type Branch,
  type CampusMode,
  type GenderOption,
} from '../types/klu';
import { KluTribeLogo } from './KluTribeLogo';
import kluDaylightCampusImg from '../assets/images/klu_daylight_campus_1794679733683.jpg';

interface OnboardingFlowProps {
  uid: string;
  email: string;
  displayName: string;
  onComplete: () => void;
  onSignOut: () => void;
}

const ARCHETYPE_ICONS = {
  'corporate-architect': Briefcase,
  'strategic-builder': Rocket,
  'campus-maverick': GraduationCap,
  'day1-hustler': Code2,
  wildcard: Compass,
};

export function OnboardingFlow({
  uid,
  email,
  displayName,
  onComplete,
  onSignOut,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Student Verification + Core Academic Details
  const [fullName, setFullName] = useState(displayName || '');
  const [kluStudentId, setKluStudentId] = useState('');
  const [branch, setBranch] = useState<Branch>('CSE');
  const [year, setYear] = useState<AcademicYear>('1st Year');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<GenderOption>('');
  const [campusMode, setCampusMode] = useState<CampusMode>('');

  // Step 2: Profile, Skills & Startup Intent
  const [skills, setSkills] = useState<string[]>(['React / Next.js']);
  const [bio, setBio] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [startupInterest, setStartupInterest] = useState(false);
  const [startupIdeaSummary, setStartupIdeaSummary] = useState('');

  // Step 3: Choose Your Path
  const [primaryCategory, setPrimaryCategory] = useState<ArchetypeId>('day1-hustler');
  const [secondaryInterests, setSecondaryInterests] = useState<string[]>([]);

  const isKluIdValid = /^[a-zA-Z0-9]{6,20}$/.test(kluStudentId.trim());

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : prev.length < 12 ? [...prev, skill] : prev
    );
  };

  const toggleSecondary = (interest: string) => {
    setSecondaryInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((s) => s !== interest)
        : prev.length < 5
          ? [...prev, interest]
          : prev
    );
  };

  const validateStep1 = (): boolean => {
    if (fullName.trim().length < 2) {
      setError('Enter your full name (at least 2 characters).');
      return false;
    }
    const cleanId = kluStudentId.trim();
    if (!/^[a-zA-Z0-9]{6,20}$/.test(cleanId)) {
      setError('Enter a valid 10-digit KL University Student ID (6–20 alphanumeric characters).');
      return false;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      setError('Enter a valid 10-digit mobile number (stored privately, never public).');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createStudentAccount({
        uid,
        email,
        fullName,
        kluStudentId,
        branch,
        year,
        phone: phone.replace(/\s+/g, ''),
        gender,
        campusMode,
        primaryCategory,
        secondaryInterests,
        skills,
        bio,
        careerGoal,
        startupInterest,
        startupIdeaSummary,
        roadmap: DEFAULT_ROADMAP,
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsMeta = [
    { num: 1 as const, title: 'Your Details', desc: 'Basic info & KLU verification' },
    { num: 2 as const, title: 'Skills & Goals', desc: 'Tech stack & startup intent' },
    { num: 3 as const, title: 'Choose Your Path', desc: 'Select your primary archetype' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F5F7] text-zinc-950 px-4 py-8 sm:px-8 flex items-center justify-center">
      {/* Daylight KL Campus Backdrop & Signature Crimson Corner Geometry */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={kluDaylightCampusImg}
          alt="KL University campus backdrop"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 h-72 w-72 rotate-45 bg-gradient-to-tr from-[#C8102E] to-[#991B1B] opacity-95 shadow-2xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-[0_24px_60px_-15px_rgba(17,24,39,0.16)] grid grid-cols-1 lg:grid-cols-12">
        {/* Left Vertical Stepper Rail */}
        <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-zinc-200 bg-[#FAFAFA] p-6 sm:p-8 flex flex-col justify-between gap-8">
          <div className="space-y-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <KluTribeLogo variant="compact" surface="light" />
                <p className="mt-2 text-xs font-medium text-zinc-500">
                  Student Onboarding
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="text-xs font-medium text-zinc-500 hover:text-[#C8102E] transition-colors"
              >
                Sign Out
              </button>
            </div>

            <div className="space-y-5">
              {stepsMeta.map((item) => {
                const active = step === item.num;
                const done = step > item.num;
                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => {
                      if (item.num === 1 || validateStep1()) {
                        setStep(item.num);
                      }
                    }}
                    className="w-full flex items-start gap-3.5 text-left group"
                  >
                    <span
                      className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors ${
                        active
                          ? 'bg-[#C8102E] text-white shadow-xs'
                          : done
                            ? 'bg-emerald-600 text-white'
                            : 'border border-zinc-300 bg-white text-zinc-500 group-hover:border-zinc-400'
                      }`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : item.num}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          active ? 'text-[#C8102E]' : done ? 'text-zinc-900' : 'text-zinc-500'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-1">
            <p className="text-[11px] font-medium text-zinc-500">Signed in Google Account</p>
            <p className="text-xs font-semibold text-zinc-900 truncate">{email}</p>
          </div>
        </aside>

        {/* Right Form Content */}
        <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-[#C8102E]">Step 1 of 3</p>
                  <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-950">
                    Your Details
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-600">
                    Your full KLU ID, phone number, and Gmail remain strictly private inside security-ruled records.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Your Tribe Pass begins as <strong className="font-semibold">Pending ID Review</strong> until verified against KL University records.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Nitesh Kumar"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">KLU Student ID * (Private)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={20}
                        value={kluStudentId}
                        onChange={(e) => setKluStudentId(e.target.value)}
                        placeholder="e.g. 2400031042"
                        className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 pr-9 py-2.5 font-mono text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                      />
                      {isKluIdValid && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">B.Tech Branch *</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value as Branch)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-[#C8102E] focus:outline-none"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>B.Tech — {b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">Current Year *</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value as AcademicYear)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-[#C8102E] focus:outline-none"
                    >
                      {ACADEMIC_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">Mobile Number * (Private)</label>
                    <input
                      type="tel"
                      required
                      maxLength={16}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 font-mono text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">Gender (Optional)</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as GenderOption)}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-[#C8102E] focus:outline-none"
                    >
                      <option value="">Skip / Leave blank</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">
                    Campus Mode (Optional — only shown if opted in)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['', 'Hosteller', 'Day Scholar'] as CampusMode[]).map((mode) => (
                      <button
                        key={mode || 'none'}
                        type="button"
                        onClick={() => setCampusMode(mode)}
                        className={`rounded-xl border px-4 py-2 text-xs font-medium transition-colors ${
                          campusMode === mode
                            ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                            : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {mode || 'Keep Private'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#A30D25] transition-colors"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-[#C8102E]">Step 2 of 3</p>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-950">
                    Skills & Goals
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-600">
                    Help peers discover you for projects, skill swaps, and co-founder matches.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">
                    Select Skills ({skills.length}/12)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CURATED_SKILLS.map((skill) => {
                      const active = skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                              : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          {active && <Check className="w-3 h-3" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700">Short Bio (Optional)</label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="What are you learning, building, or exploring at KL University?"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700">4-Year Career Goal (Optional)</label>
                  <input
                    type="text"
                    maxLength={200}
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. Systems Engineer / Build an AI SaaS before graduation"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                  />
                </div>

                <div className="space-y-3 border-t border-zinc-200 pt-4">
                  <label className="flex items-center gap-3 text-sm text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={startupInterest}
                      onChange={(e) => setStartupInterest(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 accent-[#C8102E]"
                    />
                    Interested in startup building or co-founder matching
                  </label>

                  {startupInterest && (
                    <input
                      type="text"
                      maxLength={280}
                      value={startupIdeaSummary}
                      onChange={(e) => setStartupIdeaSummary(e.target.value)}
                      placeholder="Optional 1-line startup idea or problem domain"
                      className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-6 py-3 text-sm font-semibold text-white hover:bg-[#A30D25] transition-colors"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-[#C8102E]">Step 3 of 3</p>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-950">
                    Choose Your Path
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-600">
                    Select your primary direction (you can update it after 90 days), plus optional secondary interests.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ARCHETYPES.map((arch) => {
                    const selected = primaryCategory === arch.id;
                    const Icon = ARCHETYPE_ICONS[arch.id];
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => setPrimaryCategory(arch.id)}
                        className={`relative text-left rounded-2xl border p-4 transition-all ${
                          selected
                            ? 'border-[#C8102E] bg-red-50/50 ring-2 ring-[#C8102E]/15'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C8102E] text-white">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 ${
                              selected
                                ? 'border-[#C8102E]/30 bg-white text-[#C8102E]'
                                : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0 pr-5">
                            <p className="font-display text-sm font-bold text-zinc-950 truncate">
                              {arch.subtitle}
                            </p>
                            <p className="text-[11px] font-medium text-zinc-500 truncate">
                              {arch.name}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2.5 text-xs text-zinc-600 leading-relaxed line-clamp-2">
                          {arch.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 border-t border-zinc-200 pt-4">
                  <label className="text-xs font-medium text-zinc-700">
                    Secondary Interests (Optional · up to 5)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SECONDARY_INTERESTS.map((interest) => {
                      const active = secondaryInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleSecondary(interest)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                              : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#A30D25] transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Creating Profile...' : 'Create My Profile'}
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
