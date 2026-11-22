import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Atom,
  BarChart3,
  BedDouble,
  Binary,
  Blocks,
  BookOpen,
  Brain,
  Briefcase,
  Check,
  ChevronDown,
  Clapperboard,
  Cloud,
  Code2,
  Coffee,
  Compass,
  Cpu,
  Dumbbell,
  FileCode2,
  GitBranch,
  GraduationCap,
  Home,
  IdCard,
  Layers,
  LogOut,
  Mail,
  Megaphone,
  Palette,
  Pencil,
  Phone,
  Rocket,
  Server,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Terminal,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  extractStudentIdFromAuthEmail,
  isStudentIdAuthEmail,
} from '../lib/firebase';
import {
  createStudentAccount,
  fetchStudentProfile,
  lookupStudentIdRegistry,
} from '../lib/kluService';
import {
  ACADEMIC_YEARS,
  ARCHETYPES,
  BRANCHES,
  CURATED_SKILLS,
  DEFAULT_ROADMAP,
  getArchetypeMeta,
  SECONDARY_INTERESTS,
  type AcademicYear,
  type ArchetypeId,
  type Branch,
  type CampusMode,
  type GenderOption,
  type StudentIdRegistryRecord,
  type StudentPublic,
} from '../types/klu';
import { KluTribeLogo } from './KluTribeLogo';
import kluDaylightCampusImg from '../assets/images/klu_daylight_campus_1794679733683.jpg';

interface OnboardingFlowProps {
  uid: string;
  email: string;
  displayName: string;
  onComplete: () => void;
  onSignOut: () => void;
  onOpenExistingAccount: (registry: StudentIdRegistryRecord) => void;
}

const ARCHETYPE_ICONS: Record<ArchetypeId, LucideIcon> = {
  'corporate-architect': Briefcase,
  'strategic-builder': Rocket,
  'campus-maverick': GraduationCap,
  'day1-hustler': Code2,
  wildcard: Compass,
};

const SKILL_ICON_META: Record<string, { icon: LucideIcon; colorClass: string }> = {
  'React / Next.js': { icon: Atom, colorClass: 'text-sky-500' },
  TypeScript: { icon: FileCode2, colorClass: 'text-blue-600' },
  Python: { icon: Terminal, colorClass: 'text-amber-500' },
  Java: { icon: Coffee, colorClass: 'text-orange-600' },
  'C++ / DSA': { icon: Binary, colorClass: 'text-blue-700' },
  'AI / ML': { icon: Brain, colorClass: 'text-purple-600' },
  'UI/UX Design': { icon: Palette, colorClass: 'text-amber-500' },
  'Node.js': { icon: Server, colorClass: 'text-emerald-600' },
  'Flutter / Mobile': { icon: Smartphone, colorClass: 'text-cyan-500' },
  'Cloud & DevOps': { icon: Cloud, colorClass: 'text-sky-600' },
  'Embedded / IoT': { icon: Cpu, colorClass: 'text-indigo-600' },
  'Video Editing': { icon: Clapperboard, colorClass: 'text-fuchsia-600' },
  'Product & Marketing': { icon: Megaphone, colorClass: 'text-pink-600' },
  Cybersecurity: { icon: ShieldCheck, colorClass: 'text-emerald-600' },
  'Data Analytics': { icon: BarChart3, colorClass: 'text-indigo-600' },
  'Blockchain / Web3': { icon: Blocks, colorClass: 'text-violet-600' },
};

const INTEREST_ICON_META: Record<string, { icon: LucideIcon; colorClass: string }> = {
  'Startup Co-founding': { icon: Rocket, colorClass: 'text-[#C8102E]' },
  Hackathons: { icon: Trophy, colorClass: 'text-amber-600' },
  'Open Source': { icon: GitBranch, colorClass: 'text-emerald-600' },
  'Competitive Programming': { icon: Terminal, colorClass: 'text-blue-600' },
  'Research & Papers': { icon: BookOpen, colorClass: 'text-indigo-600' },
  Freelancing: { icon: Briefcase, colorClass: 'text-orange-600' },
  'Clubs & Fests': { icon: Sparkles, colorClass: 'text-pink-600' },
  'Higher Studies (MS/MBA)': { icon: GraduationCap, colorClass: 'text-violet-600' },
  'Design & Media': { icon: Palette, colorClass: 'text-fuchsia-600' },
  'Sports & Athletics': { icon: Dumbbell, colorClass: 'text-teal-600' },
};

function CrimsonBrushUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 14"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 -bottom-1.5 w-full h-3 ${className}`}
      preserveAspectRatio="none"
    >
      <path
        d="M3 10.5C58 2.8 148 1.5 217 8.2"
        stroke="#C8102E"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M38 12.2C96 7.5 156 6.8 202 10.5"
        stroke="#E11D48"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.55"
      />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

function ValidBadge() {
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
      <Check className="w-3.5 h-3.5 stroke-[3]" />
    </span>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked ? 'border-[#C8102E] bg-white' : 'border-zinc-300 bg-white'
      }`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-[#C8102E]" />}
    </span>
  );
}

export function OnboardingFlow({
  uid,
  email,
  displayName,
  onComplete,
  onSignOut,
  onOpenExistingAccount,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState(false);
  const [existingMatch, setExistingMatch] = useState<{
    registry: StudentIdRegistryRecord;
    profile: StudentPublic | null;
  } | null>(null);

  const isStudentIdLogin = isStudentIdAuthEmail(email);
  const presetStudentId = extractStudentIdFromAuthEmail(email);

  // Step 1: Student Verification + Core Academic Details (all compulsory)
  const [fullName, setFullName] = useState(displayName || '');
  const [kluStudentId, setKluStudentId] = useState(presetStudentId || '');
  const [contactEmail, setContactEmail] = useState(isStudentIdLogin ? '' : email);
  const [branch, setBranch] = useState<Branch | ''>('');
  const [year, setYear] = useState<AcademicYear | ''>('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<GenderOption>('');
  const [campusMode, setCampusMode] = useState<CampusMode>('');

  // Step 2: Profile, Skills & Startup Intent (all compulsory)
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [startupInterest, setStartupInterest] = useState<boolean | null>(null);
  const [startupIdeaSummary, setStartupIdeaSummary] = useState('');

  // Step 3: Choose Your Path (all compulsory)
  const [primaryCategory, setPrimaryCategory] = useState<ArchetypeId | null>(null);
  const [secondaryInterests, setSecondaryInterests] = useState<string[]>([]);

  const isFullNameValid = fullName.trim().length >= 2;
  const isKluIdValid = /^[a-zA-Z0-9]{6,20}$/.test(kluStudentId.trim());
  const isContactEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()) && contactEmail.trim().length <= 160;
  const phoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length >= 10 && phoneDigits.length <= 15;
  const isCareerGoalValid = careerGoal.trim().length >= 5;

  // Automatically check if entered University ID already has an existing KLU TRIBE profile
  useEffect(() => {
    const cleanId = kluStudentId.trim().toUpperCase();
    if (!/^[A-Z0-9]{6,20}$/.test(cleanId)) {
      setExistingMatch(null);
      setCheckingId(false);
      return;
    }

    let cancelled = false;
    setCheckingId(true);
    const timer = window.setTimeout(async () => {
      try {
        const reg = await lookupStudentIdRegistry(cleanId);
        if (cancelled) return;
        if (reg && reg.ownerUid !== uid) {
          let profile: StudentPublic | null = null;
          try {
            profile = await fetchStudentProfile(reg.ownerUid);
          } catch {
            profile = null;
          }
          if (!cancelled) {
            setExistingMatch({ registry: reg, profile });
          }
        } else {
          setExistingMatch(null);
        }
      } catch {
        if (!cancelled) setExistingMatch(null);
      } finally {
        if (!cancelled) setCheckingId(false);
      }
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [kluStudentId, uid]);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep1 = (): boolean => {
    if (!isFullNameValid) {
      setError('Enter your full name (at least 2 characters).');
      return false;
    }
    if (!isKluIdValid) {
      setError('Enter a valid KL University Student ID (6–20 alphanumeric characters).');
      return false;
    }
    if (existingMatch) {
      setError(
        `University ID "${existingMatch.registry.kluStudentId}" already has an existing KLU TRIBE profile (${existingMatch.registry.fullName}). Open your existing profile above instead of creating a duplicate.`
      );
      return false;
    }
    if (isStudentIdLogin && !isContactEmailValid) {
      setError('Enter a valid personal or university email address.');
      return false;
    }
    if (!branch) {
      setError('Select your B.Tech branch.');
      return false;
    }
    if (!year) {
      setError('Select your current academic year.');
      return false;
    }
    if (!isPhoneValid) {
      setError('Enter a valid 10-digit mobile number (stored privately, never public).');
      return false;
    }
    if (!gender) {
      setError('Select your gender.');
      return false;
    }
    if (!campusMode) {
      setError('Select your campus mode (Hosteller or Day Scholar).');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (skills.length < 1) {
      setError('Select at least 1 skill to continue.');
      return false;
    }
    if (bio.trim().length < 10) {
      setError('Write a short bio (at least 10 characters).');
      return false;
    }
    if (!isCareerGoalValid) {
      setError('Enter your 4-year career goal (at least 5 characters).');
      return false;
    }
    if (startupInterest === null) {
      setError('Select whether you are interested in startup building or co-founder matching.');
      return false;
    }
    if (startupInterest && startupIdeaSummary.trim().length < 5) {
      setError('Enter your 1-line startup idea or problem domain (at least 5 characters).');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!primaryCategory) {
      setError('Choose your primary path to continue.');
      return false;
    }
    if (secondaryInterests.length < 1) {
      setError('Select at least 1 secondary interest.');
      return false;
    }
    setError(null);
    return true;
  };

  const goToStep = (target: 1 | 2 | 3) => {
    if (target === 1) {
      setError(null);
      setStep(1);
      scrollToTop();
      return;
    }
    if (target === 2) {
      if (validateStep1()) {
        setStep(2);
        scrollToTop();
      }
      return;
    }
    if (!validateStep1()) {
      setStep(1);
      scrollToTop();
    } else if (validateStep2()) {
      setStep(3);
      scrollToTop();
    } else {
      setStep(2);
      scrollToTop();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        scrollToTop();
      }
      return;
    }
    if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        scrollToTop();
      }
      return;
    }
    if (!validateStep1()) {
      setStep(1);
      scrollToTop();
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      scrollToTop();
      return;
    }
    if (!validateStep3() || !branch || !year || !primaryCategory || startupInterest === null) {
      setStep(3);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createStudentAccount({
        uid,
        email: isStudentIdLogin ? contactEmail.trim() : email,
        authMethod: isStudentIdLogin ? 'student_id' : 'google',
        fullName,
        kluStudentId,
        branch,
        year,
        phone: phone.replace(/[^\d+]/g, '').slice(0, 16),
        gender,
        campusMode,
        primaryCategory,
        secondaryInterests,
        skills,
        bio,
        careerGoal,
        startupInterest,
        startupIdeaSummary: startupInterest ? startupIdeaSummary : '',
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#F8F9FB] text-[#0B0F19] pb-14">
      {/* Decorative Crimson Wave Accents (Bottom-Right Corner) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 420 260"
        fill="none"
        className="pointer-events-none fixed bottom-0 right-0 w-64 sm:w-96 h-auto opacity-80 z-0"
      >
        <path
          d="M90 260C180 235 285 180 420 75V260H90Z"
          fill="url(#kluOnboardingWave)"
          fillOpacity="0.16"
        />
        <path
          d="M150 260C235 225 320 175 420 100"
          stroke="#C8102E"
          strokeOpacity="0.32"
          strokeWidth="1.5"
        />
        <path
          d="M190 260C265 228 335 188 420 125"
          stroke="#C8102E"
          strokeOpacity="0.22"
          strokeWidth="1.2"
        />
        <path
          d="M235 260C295 235 355 202 420 152"
          stroke="#C8102E"
          strokeOpacity="0.4"
          strokeWidth="1.8"
        />
        <defs>
          <linearGradient id="kluOnboardingWave" x1="120" y1="260" x2="420" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDA4AF" />
            <stop offset="1" stopColor="#C8102E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top Campus Header Banner */}
      <header className="relative w-full overflow-hidden bg-white">
        {/* Subtle Top-Left Crimson Ribbon Accent */}
        <svg
          aria-hidden="true"
          viewBox="0 0 320 140"
          fill="none"
          className="pointer-events-none absolute top-0 left-0 w-56 sm:w-72 h-auto opacity-75"
        >
          <path d="M-20 70C45 55 110 25 180 -10" stroke="#FDA4AF" strokeWidth="1.2" />
          <path d="M-20 84C55 64 125 32 205 -10" stroke="#FB7185" strokeWidth="1" strokeOpacity="0.6" />
          <path d="M-20 55C35 42 85 18 140 -10" stroke="#C8102E" strokeWidth="1" strokeOpacity="0.35" />
        </svg>

        {/* Right-Side Blended Daylight KL University Campus Photo */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[68%] lg:w-[58%] overflow-hidden">
          <img
            src={kluDaylightCampusImg}
            alt="KL University campus"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center sm:object-right opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 sm:via-white/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F8F9FB] via-[#F8F9FB]/75 to-transparent" />
        </div>

        {/* Bottom fade across entire header */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F8F9FB] to-transparent" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pt-5 sm:pt-7 pb-6 sm:pb-8">
          {/* Top Brand + Sign Out Row */}
          <div className="flex items-center justify-between gap-4">
            <KluTribeLogo variant="compact" surface="light" />
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/95 backdrop-blur-xs px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-800 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.12)] hover:border-rose-200 hover:text-[#C8102E] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Hero Title + Rocket Subtitle */}
          <div className="mt-6 sm:mt-7 max-w-xl">
            <h1 className="font-display text-3xl sm:text-[40px] font-extrabold tracking-tight leading-tight text-[#0B0F19]">
              Student{' '}
              <span className="relative inline-block text-[#C8102E]">
                Onboarding
                <CrimsonBrushUnderline />
              </span>
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-100 bg-[#FFF0F2] text-[#C8102E] shadow-xs">
                <Rocket className="w-5 h-5" />
              </span>
              <p className="text-sm sm:text-[15px] font-medium text-zinc-700 leading-snug">
                Let&apos;s set up your KLU Tribe profile in 3 quick steps. It only takes 2–3 minutes!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 space-y-5">
        {/* Horizontal 3-Step Progress Stepper */}
        <nav aria-label="Onboarding progress" className="pt-1 pb-1">
          <div className="relative grid grid-cols-3 gap-2 sm:gap-4">
            {/* Connector Line 1 -> 2 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-5 left-[16.666%] w-[33.333%] h-[2.5px] bg-zinc-200 overflow-hidden rounded-full"
            >
              <div
                className="h-full bg-[#C8102E] transition-all duration-300"
                style={{ width: step === 1 ? '48%' : '100%' }}
              />
            </div>

            {/* Connector Line 2 -> 3 */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-5 left-[50%] w-[33.333%] h-[2.5px] bg-zinc-200 overflow-hidden rounded-full"
            >
              <div
                className="h-full bg-[#C8102E] transition-all duration-300"
                style={{ width: step === 1 ? '0%' : step === 2 ? '48%' : '100%' }}
              />
            </div>

            {stepsMeta.map((item) => {
              const active = step === item.num;
              const done = step > item.num;
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => goToStep(item.num)}
                  className="relative z-10 flex flex-col items-center text-center group focus:outline-none"
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      done
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : active
                          ? 'bg-[#C8102E] text-white shadow-[0_6px_16px_-4px_rgba(200,16,46,0.5)] ring-4 ring-rose-100'
                          : 'border-2 border-zinc-300 bg-white text-zinc-600 group-hover:border-zinc-400'
                    }`}
                  >
                    {done ? <Check className="w-5 h-5 stroke-[2.75]" /> : item.num}
                  </span>

                  <span
                    className={`mt-2 inline-block rounded-lg px-2 py-0.5 text-xs sm:text-sm font-bold transition-colors ${
                      active
                        ? 'bg-[#FFF0F2] text-[#C8102E]'
                        : done
                          ? 'text-zinc-900'
                          : 'text-zinc-700 group-hover:text-zinc-950'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span
                    className={`mt-0.5 hidden sm:block text-[11px] leading-tight ${
                      active ? 'text-[#C8102E]/90 font-medium' : 'text-zinc-500'
                    }`}
                  >
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Signed-In Account Card */}
        <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-r from-[#FFF4F6] via-[#FFF9FA] to-[#FFF4F6] px-4 py-3.5 sm:px-5 sm:py-4 shadow-[0_6px_20px_-10px_rgba(200,16,46,0.18)] flex items-center gap-3.5 sm:gap-4">
          <div className="inline-flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-white shadow-xs">
            {isStudentIdLogin ? (
              <IdCard className="w-6 h-6 text-[#C8102E]" />
            ) : (
              <GoogleMark />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-600">
              {isStudentIdLogin ? 'Signed in with University Student ID' : 'Signed in with Google Account'}
            </p>
            <div className="mt-0.5 flex items-center gap-2 min-w-0">
              <p className="truncate text-sm sm:text-base font-bold text-zinc-950">
                {isStudentIdLogin ? presetStudentId : email}
              </p>
              <ValidBadge />
            </div>
          </div>
        </div>

        {/* Elevated Main White Form Card */}
        <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 sm:p-8 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.12)]">
          {/* Step Indicator Bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
            <span className="inline-flex items-center rounded-full bg-[#C8102E] px-3.5 py-1 text-white shadow-xs">
              Step {step} of 3
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#9F1239]">
              <span className="h-2 w-2 rounded-full bg-[#C8102E]" />
              All fields are required
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm font-medium text-red-700"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5">
            {/* ==================== STEP 1: YOUR DETAILS ==================== */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Section Header */}
                <div className="flex items-start gap-3.5">
                  <span className="inline-flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-[#FFF0F2] text-[#C8102E]">
                    <User className="w-6 h-6 sm:w-7 sm:h-7" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#0B0F19]">
                      Your Details
                    </h2>
                    <p className="mt-0.5 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      All fields are mandatory. Your full KLU ID, phone number, and email remain strictly private inside security-ruled records.
                    </p>
                  </div>
                </div>

                {/* Pending ID Review Callout */}
                <div className="rounded-2xl border border-amber-200/90 bg-[#FFFBF0] px-4 py-3.5 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Your Tribe Pass begins as{' '}
                    <strong className="font-bold text-amber-900">Pending ID Review</strong> until verified against KL University records.
                  </span>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                      Full Name <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-r border-zinc-200 text-zinc-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={80}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Nitesh Kumar"
                        className="w-full bg-transparent px-3.5 py-2.5 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
                      />
                      {isFullNameValid && (
                        <span className="pr-3">
                          <ValidBadge />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KLU Student ID */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                      KLU Student ID <span className="text-[#C8102E]">*</span>{' '}
                      <span className="font-medium text-zinc-500">
                        (Private{isStudentIdLogin ? ' · Linked to Login' : ''})
                      </span>
                    </label>
                    <div
                      className={`relative flex items-center rounded-xl border border-zinc-300 focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all ${
                        isStudentIdLogin ? 'bg-zinc-100' : 'bg-white'
                      }`}
                    >
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-r border-zinc-200 text-zinc-500">
                        <IdCard className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        readOnly={isStudentIdLogin}
                        maxLength={20}
                        value={kluStudentId}
                        onChange={(e) => setKluStudentId(e.target.value)}
                        placeholder="e.g. 2400031042"
                        className={`w-full bg-transparent px-3.5 py-2.5 font-mono text-sm font-medium placeholder:text-zinc-400 focus:outline-none ${
                          isStudentIdLogin ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-950'
                        }`}
                      />
                      {isKluIdValid && !existingMatch && !checkingId && (
                        <span className="pr-3">
                          <ValidBadge />
                        </span>
                      )}
                    </div>

                    {checkingId && (
                      <p className="text-[11px] font-medium text-zinc-500">
                        Checking KL University ID registry...
                      </p>
                    )}

                    {existingMatch && (
                      <div className="mt-2 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-rose-50/40 p-4 space-y-3 shadow-xs">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                              Existing Profile Found
                            </span>
                            <p className="font-display text-base font-extrabold text-zinc-950 pt-1">
                              {existingMatch.profile?.fullName || existingMatch.registry.fullName}
                            </p>
                            <p className="text-xs font-medium text-zinc-600">
                              <span className="font-mono font-semibold text-[#C8102E]">
                                #{existingMatch.registry.memberNumber}
                              </span>{' '}
                              · B.Tech {existingMatch.registry.branch} · {existingMatch.registry.year}
                            </p>
                            {existingMatch.profile && (
                              <p className="text-xs text-zinc-600 pt-0.5">
                                Path:{' '}
                                <strong className="text-zinc-900">
                                  {getArchetypeMeta(existingMatch.profile.primaryCategory).subtitle}
                                </strong>
                                {existingMatch.profile.skills.length > 0 && (
                                  <> · {existingMatch.profile.skills.slice(0, 3).join(', ')}</>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-700 leading-relaxed">
                          This University ID (<strong className="font-mono">{existingMatch.registry.kluStudentId}</strong>) is already registered using{' '}
                          <strong>
                            {existingMatch.registry.authMethod === 'google'
                              ? 'Google Sign-In'
                              : 'University ID & Password'}
                          </strong>
                          . Open your existing profile directly instead of filling the form again.
                        </p>

                        <button
                          type="button"
                          onClick={() => onOpenExistingAccount(existingMatch.registry)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DC143C] via-[#C8102E] to-[#A60C25] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:brightness-105 transition-all"
                        >
                          <span>
                            {existingMatch.registry.authMethod === 'google'
                              ? 'Open Existing Profile with Google'
                              : `Login to Existing Profile (${existingMatch.registry.kluStudentId})`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contact Email (Required when signed in via Student ID) */}
                  {isStudentIdLogin && (
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                        Email Address <span className="text-[#C8102E]">*</span>{' '}
                        <span className="font-medium text-zinc-500">
                          (Private — Personal or University Email)
                        </span>
                      </label>
                      <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-r border-zinc-200 text-zinc-500">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          maxLength={160}
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="e.g. 2400031042@kluniversity.in or your Gmail"
                          className="w-full bg-transparent px-3.5 py-2.5 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
                        />
                        {isContactEmailValid && (
                          <span className="pr-3">
                            <ValidBadge />
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Branch + Current Year 2-Column Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                        B.Tech Branch <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-r border-zinc-200 text-zinc-500">
                          <GraduationCap className="w-4 h-4" />
                        </span>
                        <select
                          required
                          value={branch}
                          onChange={(e) => setBranch(e.target.value as Branch | '')}
                          className={`w-full appearance-none bg-transparent pl-3.5 pr-9 py-2.5 text-sm font-medium focus:outline-none ${
                            branch ? 'text-zinc-950' : 'text-zinc-500'
                          }`}
                        >
                          <option value="">Select your branch</option>
                          {BRANCHES.map((b) => (
                            <option key={b} value={b} className="text-zinc-950">
                              B.Tech — {b}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 w-4 h-4 text-zinc-500" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                        Current Year <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-r border-zinc-200 text-zinc-500">
                          <Layers className="w-4 h-4" />
                        </span>
                        <select
                          required
                          value={year}
                          onChange={(e) => setYear(e.target.value as AcademicYear | '')}
                          className={`w-full appearance-none bg-transparent pl-3.5 pr-9 py-2.5 text-sm font-medium focus:outline-none ${
                            year ? 'text-zinc-950' : 'text-zinc-500'
                          }`}
                        >
                          <option value="">Select your year</option>
                          {ACADEMIC_YEARS.map((y) => (
                            <option key={y} value={y} className="text-zinc-950">
                              {y}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 w-4 h-4 text-zinc-500" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                      Mobile Number <span className="text-[#C8102E]">*</span>{' '}
                      <span className="font-medium text-zinc-500">(Private)</span>
                    </label>
                    <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-r border-zinc-200 text-zinc-500">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={16}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full bg-transparent px-3.5 py-2.5 font-mono text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
                      />
                      {isPhoneValid && (
                        <span className="pr-3">
                          <ValidBadge />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                      Gender <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-r border-zinc-200 text-zinc-500">
                        <Users className="w-4 h-4" />
                      </span>
                      <select
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value as GenderOption)}
                        className={`w-full appearance-none bg-transparent pl-3.5 pr-9 py-2.5 text-sm font-medium focus:outline-none ${
                          gender ? 'text-zinc-950' : 'text-zinc-500'
                        }`}
                      >
                        <option value="">Select your gender</option>
                        <option value="Male" className="text-zinc-950">Male</option>
                        <option value="Female" className="text-zinc-950">Female</option>
                        <option value="Non-binary" className="text-zinc-950">Non-binary</option>
                        <option value="Prefer not to say" className="text-zinc-950">Prefer not to say</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 w-4 h-4 text-zinc-500" />
                    </div>
                  </div>

                  {/* Campus Mode */}
                  <div className="space-y-2 pt-0.5">
                    <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                      Campus Mode <span className="text-[#C8102E]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(
                        [
                          { value: 'Hosteller' as CampusMode, icon: BedDouble },
                          { value: 'Day Scholar' as CampusMode, icon: Home },
                        ]
                      ).map(({ value, icon: ModeIcon }) => {
                        const selected = campusMode === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setCampusMode(value)}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                              selected
                                ? 'border-[#C8102E] bg-[#FFF4F6] text-[#C8102E] shadow-xs'
                                : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400'
                            }`}
                          >
                            <RadioDot checked={selected} />
                            <ModeIcon className={`w-4 h-4 ${selected ? 'text-[#C8102E]' : 'text-zinc-500'}`} />
                            <span>{value}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 1 Primary CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) {
                        setStep(2);
                        scrollToTop();
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DC143C] via-[#C8102E] to-[#A60C25] px-6 py-3.5 text-base font-bold text-white shadow-[0_12px_24px_-8px_rgba(200,16,46,0.5)] hover:brightness-105 active:scale-[0.99] transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ==================== STEP 2: SKILLS & GOALS ==================== */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="flex items-start gap-3.5">
                  <span className="inline-flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-[#FFF0F2] text-[#C8102E]">
                    <Code2 className="w-6 h-6 sm:w-7 sm:h-7" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#0B0F19]">
                      Skills &amp;{' '}
                      <span className="relative inline-block text-[#C8102E]">
                        Goals
                        <CrimsonBrushUnderline />
                      </span>
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      Tell us about your skills, interests, and long-term goals so peers can discover you for projects, skill swaps, and co-founder matches.
                    </p>
                  </div>
                </div>

                {/* Skills Selection */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900">
                      <Star className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <span>
                        Select Skills <span className="text-[#C8102E]">*</span>{' '}
                        <span className="font-medium text-zinc-500">
                          (Min 1, {skills.length}/12 selected)
                        </span>
                      </span>
                    </label>
                    <span className="rounded-full bg-[#FFF0F2] px-2.5 py-0.5 text-[11px] font-bold text-[#C8102E]">
                      {skills.length}/12
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CURATED_SKILLS.map((skill) => {
                      const active = skills.includes(skill);
                      const meta = SKILL_ICON_META[skill] || {
                        icon: Code2,
                        colorClass: 'text-zinc-600',
                      };
                      const SkillIcon = meta.icon;
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs sm:text-[13px] font-semibold transition-all ${
                            active
                              ? 'border-[#C8102E] bg-[#FFF2F4] text-[#C8102E] shadow-xs ring-1 ring-[#C8102E]/20'
                              : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          <SkillIcon
                            className={`w-4 h-4 shrink-0 ${active ? 'text-[#C8102E]' : meta.colorClass}`}
                          />
                          <span>{skill}</span>
                          {active && <Check className="w-3.5 h-3.5 stroke-[2.75] text-[#C8102E]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Short Bio */}
                <div className="space-y-1.5">
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900">
                    <Pencil className="w-4 h-4 text-[#C8102E] shrink-0" />
                    <span>
                      Short Bio <span className="text-[#C8102E]">*</span>{' '}
                      <span className="font-medium text-zinc-500">(Min 10 characters)</span>
                    </span>
                  </label>
                  <div className="relative rounded-2xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                    <textarea
                      required
                      rows={3}
                      maxLength={500}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="What are you learning, building, or exploring at KL University?"
                      className="w-full resize-none bg-transparent px-4 pt-3 pb-7 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
                    />
                    <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[11px] font-medium text-zinc-400">
                      {bio.length}/500
                    </span>
                  </div>
                </div>

                {/* 4-Year Career Goal */}
                <div className="space-y-1.5">
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900">
                    <Target className="w-4 h-4 text-[#C8102E] shrink-0" />
                    <span>
                      4-Year Career Goal <span className="text-[#C8102E]">*</span>
                    </span>
                  </label>
                  <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                      placeholder="e.g. Systems Engineer / Build an AI SaaS / Start my own company"
                      className="w-full bg-transparent px-4 py-3 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
                    />
                    {isCareerGoalValid && (
                      <span className="pr-3">
                        <ValidBadge />
                      </span>
                    )}
                  </div>
                </div>

                {/* Startup Building / Co-Founder Interest */}
                <div className="space-y-3 border-t border-zinc-100 pt-4">
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900">
                    <Users className="w-4 h-4 text-[#C8102E] shrink-0" />
                    <span>
                      Interested in startup building or co-founder matching?{' '}
                      <span className="text-[#C8102E]">*</span>
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStartupInterest(true)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                        startupInterest === true
                          ? 'border-[#C8102E] bg-[#FFF4F6] text-[#C8102E] shadow-xs'
                          : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <RadioDot checked={startupInterest === true} />
                      <span>Yes, I&apos;m Interested</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStartupInterest(false);
                        setStartupIdeaSummary('');
                      }}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                        startupInterest === false
                          ? 'border-[#C8102E] bg-[#FFF4F6] text-[#C8102E] shadow-xs'
                          : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <RadioDot checked={startupInterest === false} />
                      <span>No, Not Right Now</span>
                    </button>
                  </div>

                  {startupInterest === true && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-xs sm:text-sm font-semibold text-zinc-800">
                        Startup Idea or Problem Domain <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative flex items-center rounded-xl border border-zinc-300 bg-white focus-within:border-[#C8102E] focus-within:ring-2 focus-within:ring-[#C8102E]/15 transition-all">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center border-r border-zinc-200 text-[#C8102E]">
                          <Rocket className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          maxLength={280}
                          value={startupIdeaSummary}
                          onChange={(e) => setStartupIdeaSummary(e.target.value)}
                          placeholder="1-line startup idea or problem domain you want to work on"
                          className="w-full bg-transparent px-3.5 py-2.5 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
                        />
                        {startupIdeaSummary.trim().length >= 5 && (
                          <span className="pr-3">
                            <ValidBadge />
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2 Footer Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(1);
                      scrollToTop();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 sm:px-6 py-3.5 text-sm font-bold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) {
                        setStep(3);
                        scrollToTop();
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DC143C] via-[#C8102E] to-[#A60C25] px-6 py-3.5 text-base font-bold text-white shadow-[0_12px_24px_-8px_rgba(200,16,46,0.5)] hover:brightness-105 active:scale-[0.99] transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ==================== STEP 3: CHOOSE YOUR PATH ==================== */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="flex items-start gap-3.5">
                  <span className="inline-flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-[#FFF0F2] text-[#C8102E]">
                    <Target className="w-6 h-6 sm:w-7 sm:h-7" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#0B0F19]">
                      Choose Your{' '}
                      <span className="relative inline-block text-[#C8102E]">
                        Path
                        <CrimsonBrushUnderline />
                      </span>
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      Select your primary direction (you can update it after 90 days) and pick at least one secondary interest.
                    </p>
                  </div>
                </div>

                {/* Primary Path Vertical Radio Cards */}
                <div className="space-y-2.5">
                  <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900">
                    <Compass className="w-4 h-4 text-[#C8102E] shrink-0" />
                    <span>
                      Primary Path <span className="text-[#C8102E]">*</span>
                    </span>
                  </label>

                  <div className="space-y-3">
                    {ARCHETYPES.map((arch) => {
                      const selected = primaryCategory === arch.id;
                      const Icon = ARCHETYPE_ICONS[arch.id];
                      return (
                        <button
                          key={arch.id}
                          type="button"
                          onClick={() => setPrimaryCategory(arch.id)}
                          className={`w-full text-left rounded-2xl border p-4 transition-all flex items-start gap-3.5 sm:gap-4 ${
                            selected
                              ? 'border-[#C8102E] bg-[#FFF5F7] shadow-[0_8px_22px_-12px_rgba(200,16,46,0.35)] ring-1 ring-[#C8102E]/20'
                              : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/70'
                          }`}
                        >
                          <span
                            className={`inline-flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                              selected
                                ? 'border-rose-200 bg-white text-[#C8102E] shadow-xs'
                                : 'border-rose-100 bg-[#FFF5F6] text-[#C8102E]'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <p
                                className={`font-display text-sm sm:text-base font-extrabold ${
                                  selected ? 'text-[#C8102E]' : 'text-[#0B0F19]'
                                }`}
                              >
                                {arch.subtitle}
                              </p>
                              <span className="text-xs font-medium text-zinc-500">
                                · {arch.name}
                              </span>
                            </div>
                            <p className="mt-1 text-xs sm:text-[13px] text-zinc-600 leading-relaxed">
                              {arch.description}
                            </p>
                          </div>

                          <div className="pt-1">
                            <RadioDot checked={selected} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary Interests */}
                <div className="space-y-2.5 border-t border-zinc-100 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900">
                      <GraduationCap className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <span>
                        Secondary Interests <span className="text-[#C8102E]">*</span>{' '}
                        <span className="font-medium text-zinc-500">
                          (Min 1, {secondaryInterests.length}/5 selected)
                        </span>
                      </span>
                    </label>
                    <span className="rounded-full bg-[#FFF0F2] px-2.5 py-0.5 text-[11px] font-bold text-[#C8102E]">
                      {secondaryInterests.length}/5
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_INTERESTS.map((interest) => {
                      const active = secondaryInterests.includes(interest);
                      const meta = INTEREST_ICON_META[interest] || {
                        icon: Sparkles,
                        colorClass: 'text-zinc-600',
                      };
                      const InterestIcon = meta.icon;
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleSecondary(interest)}
                          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs sm:text-[13px] font-semibold transition-all ${
                            active
                              ? 'border-[#C8102E] bg-[#FFF2F4] text-[#C8102E] shadow-xs ring-1 ring-[#C8102E]/20'
                              : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          <InterestIcon
                            className={`w-4 h-4 shrink-0 ${active ? 'text-[#C8102E]' : meta.colorClass}`}
                          />
                          <span>{interest}</span>
                          {active && <Check className="w-3.5 h-3.5 stroke-[2.75] text-[#C8102E]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3 Footer Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(2);
                      scrollToTop();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 sm:px-6 py-3.5 text-sm font-bold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DC143C] via-[#C8102E] to-[#A60C25] px-6 py-3.5 text-base font-bold text-white shadow-[0_12px_24px_-8px_rgba(200,16,46,0.5)] hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60"
                  >
                    <span>{submitting ? 'Creating Profile...' : 'Create My Profile'}</span>
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
