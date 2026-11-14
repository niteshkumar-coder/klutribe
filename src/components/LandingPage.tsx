import { useEffect, useState, type ComponentType } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  Code2,
  Compass,
  Crown,
  EyeOff,
  GraduationCap,
  Heart,
  HeartHandshake,
  IdCard,
  Layers,
  Lightbulb,
  Lock,
  Play,
  QrCode,
  Rocket,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ARCHETYPES, DEFAULT_ROADMAP, type ArchetypeId, type StudentPublic } from '../types/klu';
import { KluTribeLogo } from './KluTribeLogo';
import { TribePassCard } from './TribePassCard';
import kluDaylightCampusImg from '../assets/images/klu_daylight_campus_1794679733683.jpg';
import kluStudentsCollabImg from '../assets/images/klu_students_collab_1794679734224.jpg';
import kluCampusSketchImg from '../assets/images/klu_campus_sketch_1794683257840.jpg';
import sampleStudentPortraitImg from '../assets/images/sample_student_portrait_1794589068766.jpg';
import pathStrategicDevImg from '../assets/images/path_strategic_developer_1794684526640.jpg';
import pathTalentHustlerImg from '../assets/images/path_talent_hustler_1794684527715.jpg';
import pathWildcardImg from '../assets/images/path_wildcard_explorer_1794684528065.jpg';
import privacyShieldImg from '../assets/images/privacy_crimson_shield_campus_1794684299881.jpg';

interface LandingPageProps {
  isSignedIn: boolean;
  hasProfile: boolean;
  onPrimaryAction: () => void;
  signingIn: boolean;
}

interface LiveStats {
  students: number | null;
  verified: number | null;
  ideas: number | null;
  projects: number | null;
  opportunities: number | null;
}

const PATH_ICONS: Record<ArchetypeId, ComponentType<{ className?: string }>> = {
  'corporate-architect': Briefcase,
  'strategic-builder': Code2,
  'campus-maverick': Users,
  'day1-hustler': Rocket,
  wildcard: Compass,
};

const PATH_IMAGES: Record<ArchetypeId, string> = {
  'corporate-architect': sampleStudentPortraitImg,
  'strategic-builder': pathStrategicDevImg,
  'campus-maverick': kluStudentsCollabImg,
  'day1-hustler': pathTalentHustlerImg,
  wildcard: pathWildcardImg,
};

const PATH_CAPTIONS: Record<ArchetypeId, string> = {
  'corporate-architect': 'Build a strong industry profile and career-ready skills.',
  'strategic-builder': 'Solve real-world problems and build impactful solutions.',
  'campus-maverick': 'Lead, create, and make a lasting impact on campus.',
  'day1-hustler': 'Showcase your talent and get recognized across campus.',
  wildcard: 'Combine your unique interests and create a custom path.',
};

export function LandingPage({
  isSignedIn,
  hasProfile,
  onPrimaryAction,
  signingIn,
}: LandingPageProps) {
  const [previewArchetype, setPreviewArchetype] = useState<ArchetypeId>('day1-hustler');
  const [stats, setStats] = useState<LiveStats>({
    students: null,
    verified: null,
    ideas: null,
    projects: null,
    opportunities: null,
  });

  useEffect(() => {
    let active = true;
    async function loadRealCounts() {
      try {
        const [studentsSnap, verifiedSnap, ideasSnap, projectsSnap, oppsSnap] = await Promise.all([
          getCountFromServer(query(collection(db, 'students'), where('isSuspended', '==', false))),
          getCountFromServer(
            query(
              collection(db, 'students'),
              where('isSuspended', '==', false),
              where('verificationStatus', '==', 'verified')
            )
          ),
          getCountFromServer(query(collection(db, 'ideas'), where('visibility', '==', 'public'))),
          getCountFromServer(
            query(collection(db, 'projects'), where('status', 'in', ['recruiting', 'active', 'completed']))
          ),
          getCountFromServer(
            query(collection(db, 'opportunities'), where('approvalStatus', '==', 'approved'))
          ),
        ]);
        if (!active) return;
        setStats({
          students: studentsSnap.data().count,
          verified: verifiedSnap.data().count,
          ideas: ideasSnap.data().count,
          projects: projectsSnap.data().count,
          opportunities: oppsSnap.data().count,
        });
      } catch {
        // Keep null if offline or rules prevent read before boot
      }
    }
    loadRealCounts();
    return () => {
      active = false;
    };
  }, []);

  const sampleStudent: StudentPublic = {
    uid: 'preview',
    memberNumber: 'KLU-000001',
    maskedStudentId: '2600••••42',
    fullName: 'Aarav Reddy',
    branch: 'CSE',
    year: '1st Year',
    batch: '2026–2030',
    primaryCategory: previewArchetype,
    secondaryInterests: ['Hackathons', 'Startup Co-founding'],
    skills: ['TypeScript', 'Python', 'AI / ML', 'UI/UX Design'],
    bio: 'Preview member card',
    careerGoal: 'Build campus software products',
    startupInterest: true,
    startupIdeaSummary: '',
    campusMode: '',
    verificationStatus: 'verified',
    isSuspended: false,
    allowConnections: true,
    roadmap: DEFAULT_ROADMAP,
    categoryUpdatedAtMs: 0,
  };

  const ctaLabel = signingIn
    ? 'Connecting...'
    : isSignedIn
      ? hasProfile
        ? 'Open Dashboard'
        : 'Complete Setup'
      : 'Join the Community';

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {/* Clean White Header Matching Reference */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-5 shrink-0">
            <a href="#top" className="inline-flex items-center whitespace-nowrap shrink-0">
              <KluTribeLogo variant="compact" surface="light" />
            </a>
            <span className="hidden lg:block h-7 w-px bg-zinc-200" aria-hidden="true" />
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a
              href="#top"
              className="border-b-2 border-[#C8102E] pb-1 font-semibold text-[#C8102E] whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <a
              href="#explore-platform"
              className="pb-1 font-medium text-zinc-700 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
            >
              Community
            </a>
            <a
              href="#paths"
              className="pb-1 font-medium text-zinc-700 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
            >
              Student Paths
            </a>
            <a
              href="#tribe-pass-preview"
              className="pb-1 font-medium text-zinc-700 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
            >
              Tribe Pass
            </a>
            <a
              href="#privacy"
              className="pb-1 font-medium text-zinc-700 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onPrimaryAction}
              disabled={signingIn}
              className="hidden sm:inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onPrimaryAction}
              disabled={signingIn}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#A30D25] transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isSignedIn ? (hasProfile ? 'Dashboard' : 'Continue Setup') : 'Join KLU TRIBE'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Crisp Full-Clarity Daylight Campus Hero */}
        <section className="relative overflow-hidden bg-white">
          {/* Right Campus Photo — 100% Sharp & Unobscured on the Right, Soft White Fade Only Under Left Text */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[74%]">
            <img
              src={kluDaylightCampusImg}
              alt="KL University engineering campus in bright daylight"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center opacity-100"
            />
            {/* Localized Left Readability Gradient Only — Right Building 100% Vivid */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 via-24% to-transparent lg:from-white lg:via-white/35 lg:via-16% lg:to-transparent" />
            {/* Signature Crimson Diagonal Corner Ribbon */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute -bottom-10 -right-10 h-72 w-36 -skew-x-[22deg] bg-gradient-to-t from-[#C8102E] via-[#C8102E]/90 to-[#E11D48]/65 shadow-lg"
            />
          </div>

          {/* Top-Right Vaddeswaram Campus Laurel Emblem over Blue Sky */}
          <div className="hidden lg:flex pointer-events-none absolute top-7 right-8 z-10 items-center gap-2.5 text-white drop-shadow-[0_2px_8px_rgba(15,23,42,0.45)]">
            <Award className="w-6 h-6 text-white/95 shrink-0" />
            <div className="text-center leading-tight">
              <p className="text-[11px] font-semibold tracking-wide text-white/95">KL University</p>
              <p className="text-xs font-extrabold tracking-tight text-white">Vaddeswaram</p>
              <p className="text-[10px] font-semibold tracking-wider text-white/90">Campus</p>
              <span className="mx-auto mt-1 block h-0.5 w-8 rounded-full bg-[#C8102E]" />
            </div>
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-5 pt-12 pb-20 sm:px-8 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
            <div className="max-w-lg space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs">
                <GraduationCap className="h-3.5 w-3.5 text-[#C8102E]" />
                Official Student Platform of KL University
              </p>

              <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.02] text-[#0B0F19] text-balance">
                KLU <span className="text-[#C8102E]">TRIBE</span>
              </h1>

              <p className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                Connect · Collaborate · Create · Grow
              </p>

              <p className="max-w-md text-sm sm:text-[15px] leading-relaxed text-zinc-700 bg-white/60 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none rounded-xl">
                A unified platform for KL University students to network, build projects, join clubs, discover opportunities, and carry a verified campus pass.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onPrimaryAction}
                  disabled={signingIn}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C8102E] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#A30D25] transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#explore-platform"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-xs hover:border-zinc-400 hover:bg-zinc-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-zinc-900 text-zinc-900" />
                  Explore Features
                </a>
              </div>

              {/* Community Avatar Trust Row */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex -space-x-2.5">
                  <img
                    src={sampleStudentPortraitImg}
                    alt="KLU student"
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border-2 border-white object-cover object-top shadow-xs"
                  />
                  <img
                    src={kluStudentsCollabImg}
                    alt="KLU peers"
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border-2 border-white object-cover object-center shadow-xs"
                  />
                  <img
                    src={pathStrategicDevImg}
                    alt="KLU developer"
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border-2 border-white object-cover object-top shadow-xs"
                  />
                  <span className="inline-flex h-8 px-2.5 items-center justify-center rounded-full border-2 border-white bg-rose-50 font-mono text-[11px] font-bold text-[#C8102E] shadow-xs">
                    {stats.students !== null ? `${stats.students}` : 'KLU'}
                  </span>
                </div>
                <span className="h-4 w-px bg-zinc-300" aria-hidden="true" />
                <p className="text-xs font-medium text-zinc-700">Trusted by KLU Students</p>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Rounded Stats Card Overlapping Hero Bottom Edge */}
        <div className="relative z-20 mx-auto max-w-6xl px-5 sm:px-8 -mt-10 sm:-mt-12">
          <div className="rounded-2xl border border-zinc-200/90 bg-white px-5 py-5 sm:px-8 sm:py-6 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="flex items-center gap-3.5">
              <Users className="w-6 h-6 text-[#C8102E] shrink-0" />
              <div>
                <p className="font-mono text-xl font-bold tabular-nums text-zinc-950">
                  {stats.students !== null ? stats.students : '—'}
                </p>
                <p className="text-xs font-medium text-zinc-500">Registered Students</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 lg:border-l lg:border-zinc-200/80 lg:pl-6">
              <BadgeCheck className="w-6 h-6 text-[#C8102E] shrink-0" />
              <div>
                <p className="font-mono text-xl font-bold tabular-nums text-zinc-950">
                  {stats.verified !== null ? stats.verified : '—'}
                </p>
                <p className="text-xs font-medium text-zinc-500">Verified KLU IDs</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 lg:border-l lg:border-zinc-200/80 lg:pl-6">
              <Lightbulb className="w-6 h-6 text-[#C8102E] shrink-0" />
              <div>
                <p className="font-mono text-xl font-bold tabular-nums text-zinc-950">
                  {stats.ideas !== null ? stats.ideas : '—'}
                </p>
                <p className="text-xs font-medium text-zinc-500">Startup Ideas</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 lg:border-l lg:border-zinc-200/80 lg:pl-6">
              <Layers className="w-6 h-6 text-[#C8102E] shrink-0" />
              <div>
                <p className="font-mono text-xl font-bold tabular-nums text-zinc-950">
                  {stats.projects !== null ? stats.projects : '—'}
                </p>
                <p className="text-xs font-medium text-zinc-500">Active Projects</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 lg:border-l lg:border-zinc-200/80 lg:pl-6">
              <Calendar className="w-6 h-6 text-[#C8102E] shrink-0" />
              <div>
                <p className="font-mono text-xl font-bold tabular-nums text-zinc-950">
                  {stats.opportunities !== null ? stats.opportunities : '—'}
                </p>
                <p className="text-xs font-medium text-zinc-500">Campus Opportunities</p>
              </div>
            </div>
          </div>
        </div>

        {/* EXPLORE KLU TRIBE — Everything You Need, in One Student Platform */}
        <section id="explore-platform" className="border-b border-zinc-200 bg-white pt-14 pb-16 sm:pt-16 sm:pb-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C8102E]">
                    Explore KLU TRIBE
                  </p>
                  <span className="h-px w-16 bg-gradient-to-r from-[#C8102E]/60 to-transparent" aria-hidden="true" />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-950 text-balance">
                  Everything You Need, in One Student Platform
                </h2>
              </div>

              <a
                href="#why-klu-tribe"
                className="inline-flex items-center gap-2 rounded-xl border border-[#C8102E]/35 bg-white px-4 py-2 text-xs font-semibold text-[#C8102E] hover:bg-red-50 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                View All Features
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <a
                href="#why-klu-tribe"
                className="group rounded-2xl border border-zinc-100 bg-white p-5 text-center space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all"
              >
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-zinc-950">Community</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Connect with peers</p>
                </div>
              </a>

              <button
                type="button"
                onClick={onPrimaryAction}
                className="group rounded-2xl border border-zinc-100 bg-white p-5 text-center space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all"
              >
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-zinc-950">Projects</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Build & showcase</p>
                </div>
              </button>

              <button
                type="button"
                onClick={onPrimaryAction}
                className="group rounded-2xl border border-zinc-100 bg-white p-5 text-center space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all"
              >
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-zinc-950">Events</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Workshops, fests & more</p>
                </div>
              </button>

              <button
                type="button"
                onClick={onPrimaryAction}
                className="group rounded-2xl border border-zinc-100 bg-white p-5 text-center space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all"
              >
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-zinc-950">Opportunities</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Internships, jobs & contests</p>
                </div>
              </button>

              <a
                href="#paths"
                className="group rounded-2xl border border-zinc-100 bg-white p-5 text-center space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all"
              >
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-zinc-950">Student Paths</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Choose your journey</p>
                </div>
              </a>

              <a
                href="#tribe-pass-preview"
                className="group rounded-2xl border border-zinc-100 bg-white p-5 text-center space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all"
              >
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-colors">
                  <IdCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-zinc-950">Tribe Pass</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Your verified campus ID</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* WHY KLU TRIBE? Split Showcase */}
        <section id="why-klu-tribe" className="relative overflow-hidden border-b border-zinc-200 bg-white py-16 sm:py-20">
          {/* Signature Bottom-Right Crimson Corner Wedge */}
          <div
            aria-hidden="true"
            className="pointer-events-none hidden lg:block absolute -bottom-8 -right-8 h-32 w-28 -skew-x-[24deg] bg-gradient-to-tr from-[#C8102E] to-[#E11D48]/85"
          />

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Framed Bright Student Collaboration Photo with Crimson Corner Wedges */}
            <div className="lg:col-span-5">
              <div className="relative p-2.5">
                {/* Top-Left Diagonal Crimson Corner Frame Accent */}
                <div
                  aria-hidden="true"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                  className="pointer-events-none absolute top-0 left-0 h-32 w-32 rounded-tl-2xl bg-[#C8102E]"
                />
                <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl">
                  <img
                    src={kluStudentsCollabImg}
                    alt="KL University engineering students collaborating over a laptop"
                    referrerPolicy="no-referrer"
                    className="h-72 sm:h-[345px] w-full object-cover object-center opacity-100"
                  />
                  {/* Bottom-Right Diagonal Crimson Corner Ribbon Inside Card */}
                  <div
                    aria-hidden="true"
                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                    className="pointer-events-none absolute bottom-0 right-0 h-20 w-24 bg-[#C8102E]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Editorial Heading, Subtitle & 4 Detailed Feature Cards */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#C8102E]">
                    Why KLU TRIBE?
                  </p>
                  <span className="h-px w-16 bg-[#C8102E]/60" aria-hidden="true" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E]" aria-hidden="true" />
                </div>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.1] text-zinc-950 text-balance">
                  More Than a Platform, It&apos;s Your Campus Network
                </h2>

                <p className="max-w-xl text-sm sm:text-[15px] leading-relaxed text-zinc-600">
                  A unified space for KL University students to connect, collaborate, showcase their work, discover opportunities, and grow together.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[#C8102E]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-sm font-bold leading-snug text-zinc-950">
                      Build Your Network
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-600">
                      Connect with peers, seniors, and mentors.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[#C8102E]">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-sm font-bold leading-snug text-zinc-950">
                      Showcase Your Work
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-600">
                      Share projects, ideas, and achievements.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[#C8102E]">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-sm font-bold leading-snug text-zinc-950">
                      Discover Opportunities
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-600">
                      Find internships, events, and competitions.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 space-y-3 shadow-xs hover:border-rose-200 hover:shadow-md transition-all">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-[#C8102E]">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-sm font-bold leading-snug text-zinc-950">
                      Be Part of Campus Life
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-600">
                      Join clubs, communities, and student initiatives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Student Path + Highlight Strip */}
        <section id="paths" className="relative overflow-hidden border-b border-zinc-200 bg-white py-16 sm:py-20">
          {/* Bright Daylight KL Campus Building Backdrop on Top-Right */}
          <div className="pointer-events-none hidden lg:block absolute top-0 right-0 h-44 w-[460px] xl:w-[540px] overflow-hidden">
            <img
              src={kluDaylightCampusImg}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-top opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 via-25% to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 space-y-9">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:pr-64">
              <div className="space-y-2 max-w-md shrink-0">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#C8102E]">
                    Five Student Paths
                  </p>
                  <span className="h-px w-16 bg-gradient-to-r from-[#C8102E]/70 to-transparent" aria-hidden="true" />
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 text-balance leading-[1.1]">
                  Pick Your Direction &amp; Preview Your <span className="text-[#C8102E]">Tribe Pass</span>
                </h2>
              </div>

              <span className="hidden lg:block h-14 w-px bg-rose-200 shrink-0" aria-hidden="true" />

              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 max-w-xs">
                Select any path below to see how your KLU TRIBE digital identity, benefits, and opportunities align with your 4-year journey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {ARCHETYPES.map((arch) => {
                const Icon = PATH_ICONS[arch.id];
                const bgImg = PATH_IMAGES[arch.id];
                const caption = PATH_CAPTIONS[arch.id];
                const selected = previewArchetype === arch.id;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setPreviewArchetype(arch.id)}
                    className={`group relative overflow-hidden rounded-2xl p-4 text-left transition-all flex flex-col justify-between min-h-[268px] ${
                      selected
                        ? 'border-2 border-[#C8102E] ring-4 ring-rose-500/20 shadow-lg'
                        : 'border border-zinc-200 hover:border-zinc-400 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <img
                      src={bgImg}
                      alt={arch.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover object-top opacity-100 transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Localized Bottom-Only Readability Scrim (Faces & Top Scene Stay Crystal Clear) */}
                    <div className="absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-black/90 via-black/55 to-transparent" />

                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                          selected
                            ? 'border-[#C8102E] bg-[#C8102E] text-white shadow-sm'
                            : 'border-white/40 bg-slate-900/50 backdrop-blur-xs text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                    </div>

                    <div className="relative z-10 pt-14 space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
                        {arch.subtitle}
                      </p>
                      <h3 className="font-display text-base font-bold text-white leading-snug">
                        {arch.name}
                      </h3>
                      <div className="flex items-end justify-between gap-2 pt-0.5">
                        <p className="text-xs leading-snug text-zinc-100/95">
                          {caption}
                        </p>
                        <span
                          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            selected
                              ? 'border-[#C8102E] bg-[#C8102E] text-white'
                              : 'border-white/60 bg-black/25 text-white group-hover:bg-white group-hover:text-zinc-950'
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Highlighted Blush Banner Strip: Your Digital Tribe Pass */}
            <a
              href="#tribe-pass-preview"
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 rounded-2xl border border-rose-100 bg-gradient-to-r from-[#FFF4F5] via-[#FFF9FA] to-white px-5 py-5 sm:px-7 shadow-xs hover:border-rose-200 transition-colors"
            >
              {/* Dual Tilted Mini Tribe Pass Visual + Copy */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
                <div className="relative h-20 w-44 shrink-0 select-none" aria-hidden="true">
                  {/* Silver Back Card */}
                  <div className="absolute left-0 top-1.5 h-16 w-28 -rotate-6 rounded-xl border border-zinc-300 bg-gradient-to-br from-zinc-100 to-zinc-300 p-2 shadow-sm">
                    <div className="h-2 w-10 rounded-full bg-zinc-400/50" />
                  </div>
                  {/* Crimson Front Card */}
                  <div className="absolute left-7 top-1 h-[70px] w-36 -rotate-2 rounded-xl border border-rose-400/40 bg-gradient-to-br from-[#C8102E] via-[#A30D25] to-[#7A081B] p-2.5 text-white shadow-md flex items-center justify-between">
                    <div className="space-y-1">
                      <KluTribeLogo variant="compact" surface="dark" className="!h-5" />
                      <p className="text-[9px] font-medium text-rose-100/90 leading-none">Tribe Pass</p>
                    </div>
                    <div className="rounded-md bg-white p-1 text-zinc-950">
                      <QrCode className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block h-12 w-px bg-rose-200/80 shrink-0" aria-hidden="true" />

                <div className="space-y-1 max-w-sm">
                  <h3 className="font-display text-lg font-extrabold tracking-tight text-zinc-950">
                    Your Digital <span className="text-[#C8102E]">Tribe Pass</span>
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-600">
                    A verified, personalized identity for your entire KLU journey — showcase your path, skills, projects, and achievements.
                  </p>
                </div>
              </div>

              {/* 3 Crimson Benefit Pillars */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-rose-200/70 pt-4 lg:pt-0 lg:pl-6">
                <div className="text-center space-y-1.5">
                  <IdCard className="w-5 h-5 text-[#C8102E] mx-auto" />
                  <p className="text-[11px] font-bold text-zinc-900">Verified Identity</p>
                </div>
                <div className="text-center space-y-1.5 border-l border-rose-200/70 pl-4 sm:pl-6">
                  <Layers className="w-5 h-5 text-[#C8102E] mx-auto" />
                  <p className="text-[11px] font-bold text-zinc-900">Track Your Journey</p>
                </div>
                <div className="text-center space-y-1.5 border-l border-rose-200/70 pl-4 sm:pl-6">
                  <Crown className="w-5 h-5 text-[#C8102E] mx-auto" />
                  <p className="text-[11px] font-bold text-zinc-900">Unlock Campus Benefits</p>
                </div>
              </div>
            </a>

          </div>
        </section>

        {/* Dedicated 2-Column Your KLU TRIBE Pass + Tribe Pass Benefits Section */}
        <section id="tribe-pass-preview" className="relative overflow-hidden border-b border-zinc-200 bg-white py-16 sm:py-20">
          {/* Subtle Crimson Campus Line-Art Sketch Behind Header Buttons */}
          <div className="pointer-events-none hidden lg:block absolute top-2 right-0 w-[340px] xl:w-[400px] overflow-hidden opacity-75">
            <img
              src={kluCampusSketchImg}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 space-y-9">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex items-stretch gap-4 max-w-xl">
                <span className="w-1 rounded-full bg-[#C8102E] shrink-0" aria-hidden="true" />
                <div className="space-y-1.5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#C8102E]">
                    Digital Identity
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950">
                    Your <span className="text-[#C8102E]">KLU TRIBE</span> Pass
                  </h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Your official student identity on the KLU TRIBE platform — with QR verification, path details, and a personalized student profile.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onPrimaryAction}
                  disabled={signingIn}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C8102E] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#A30D25] transition-colors whitespace-nowrap shrink-0"
                >
                  <Ticket className="w-4 h-4" />
                  {isSignedIn ? (hasProfile ? 'Open Your Pass' : 'Complete Setup') : 'Claim Your Pass'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href="#privacy"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-900 shadow-xs hover:border-zinc-400 hover:bg-zinc-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-zinc-900 text-zinc-900" />
                  See How It Works
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 flex flex-col justify-center">
                <TribePassCard
                  student={sampleStudent}
                  avatarUrl={sampleStudentPortraitImg}
                  isPreview
                  showActions={false}
                />
              </div>

              {/* Right Column: Tribe Pass Benefits Panel */}
              <div className="lg:col-span-4 rounded-3xl border border-rose-100 bg-gradient-to-b from-[#FFF4F5] via-[#FFF9FA] to-white p-6 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-2.5 pb-4 border-b border-rose-100">
                  <Crown className="w-5 h-5 text-[#C8102E] shrink-0" />
                  <h3 className="font-display text-lg font-extrabold tracking-tight text-zinc-950">
                    Tribe Pass Benefits
                  </h3>
                </div>

                <div className="divide-y divide-rose-100/80 flex-1 flex flex-col justify-around">
                  <div className="flex items-center gap-3.5 py-3.5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-white text-[#C8102E] shadow-2xs shrink-0">
                      <BadgeCheck className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-950">Verified Student Identity</p>
                      <p className="text-xs text-zinc-600">Official KLU student verification</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 py-3.5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-white text-[#C8102E] shadow-2xs shrink-0">
                      <Layers className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-950">Showcase Your Path</p>
                      <p className="text-xs text-zinc-600">Highlight your interests and goals</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 py-3.5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-white text-[#C8102E] shadow-2xs shrink-0">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-950">Access Opportunities</p>
                      <p className="text-xs text-zinc-600">Internships, projects &amp; events</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 py-3.5 pb-1">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-white text-[#C8102E] shadow-2xs shrink-0">
                      <Users className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-zinc-950">Build Your Network</p>
                      <p className="text-xs text-zinc-600">Connect with peers, mentors &amp; clubs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Promise — Full-Clarity Crimson Shield + Campus Showcase */}
        <section id="privacy" className="relative overflow-hidden border-b border-zinc-200 bg-white py-16 sm:py-20">
          {/* Bright Daylight Campus + Crimson Padlock Shield Artwork on Right */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[68%] overflow-hidden">
            <img
              src={privacyShieldImg}
              alt="KL University privacy security shield with padlock"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-24% to-transparent lg:via-white/55 lg:via-16%" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/75 to-transparent" />
            {/* Signature Bottom-Right Crimson Diagonal Ribbon */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute -bottom-10 -right-10 h-64 w-32 -skew-x-[22deg] bg-gradient-to-t from-[#C8102E] to-[#E11D48]/85 shadow-lg"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Copy & Guarantee Chips */}
              <div className="lg:col-span-5 space-y-5">
                <p className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/95 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#C8102E]">
                  <ShieldCheck className="w-4 h-4" />
                  Privacy Promise
                </p>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-[1.08] text-zinc-950 text-balance">
                  Your Personal Details Never Leak to the{' '}
                  <span className="text-[#C8102E]">Public Directory</span>
                </h2>

                <p className="text-sm sm:text-[15px] leading-relaxed text-zinc-700 bg-white/70 sm:bg-transparent rounded-xl">
                  Mobile numbers, personal email addresses, gender, and full 10-digit KL University IDs are isolated in security-ruled private records. Direct messaging unlocks only after mutual connection acceptance.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs">
                    <Lock className="w-3.5 h-3.5 text-[#C8102E]" />
                    University Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C8102E]" />
                    Secure by Design
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-xs">
                    <Users className="w-3.5 h-3.5 text-[#C8102E]" />
                    Student First
                  </span>
                </div>
              </div>

              {/* Right Staggered Floating Security Cards Leaving Center Crimson Shield Clear */}
              <div className="lg:col-span-7 relative">
                {/* Desktop Staggered Layout */}
                <div className="hidden lg:block relative h-[330px] w-full">
                  <div className="absolute top-3 left-2 w-56 rounded-2xl border border-white bg-white/90 backdrop-blur-md p-4 space-y-2 shadow-[0_18px_40px_-15px_rgba(15,23,42,0.18)]">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E]">
                      <EyeOff className="h-5 w-5" />
                    </div>
                    <p className="font-display text-sm font-bold text-zinc-950">No Public PII</p>
                    <p className="text-xs leading-relaxed text-zinc-600">
                      Phone, email &amp; unmasked ID stay private
                    </p>
                  </div>

                  <div className="absolute bottom-3 left-8 w-56 rounded-2xl border border-white bg-white/90 backdrop-blur-md p-4 space-y-2 shadow-[0_18px_40px_-15px_rgba(15,23,42,0.18)]">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E]">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <p className="font-display text-sm font-bold text-zinc-950">Safe QR Link</p>
                    <p className="text-xs leading-relaxed text-zinc-600">
                      Encodes only your public pass identifier
                    </p>
                  </div>

                  <div className="absolute top-1/2 -translate-y-1/2 right-2 w-56 rounded-2xl border border-white bg-white/90 backdrop-blur-md p-4 space-y-2 shadow-[0_18px_40px_-15px_rgba(15,23,42,0.18)]">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#C8102E]">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <p className="font-display text-sm font-bold text-zinc-950">Real Review</p>
                    <p className="text-xs leading-relaxed text-zinc-600">
                      Verified badge after institutional ID check
                    </p>
                  </div>
                </div>

                {/* Mobile / Tablet Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 lg:hidden">
                  <div className="rounded-2xl border border-zinc-200/90 bg-white/95 backdrop-blur-xs p-4 space-y-2 shadow-sm">
                    <EyeOff className="h-5 w-5 text-[#C8102E]" />
                    <p className="text-xs font-bold text-zinc-950">No Public PII</p>
                    <p className="text-[11px] leading-relaxed text-zinc-600">
                      Phone, email &amp; unmasked ID stay private
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200/90 bg-white/95 backdrop-blur-xs p-4 space-y-2 shadow-sm">
                    <QrCode className="h-5 w-5 text-[#C8102E]" />
                    <p className="text-xs font-bold text-zinc-950">Safe QR Link</p>
                    <p className="text-[11px] leading-relaxed text-zinc-600">
                      Encodes only your public pass identifier
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200/90 bg-white/95 backdrop-blur-xs p-4 space-y-2 shadow-sm">
                    <BadgeCheck className="h-5 w-5 text-[#C8102E]" />
                    <p className="text-xs font-bold text-zinc-950">Real Review</p>
                    <p className="text-[11px] leading-relaxed text-zinc-600">
                      Verified badge after institutional ID check
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 4-Pillar Security & Trust Strip */}
            <div className="mt-10 rounded-2xl border border-rose-100 bg-gradient-to-r from-[#FFF4F5] via-[#FFF9FA] to-white px-5 py-5 sm:px-7 shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-0 lg:divide-x lg:divide-rose-200/70">
              <div className="flex items-center gap-3.5 lg:pr-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-[#C8102E] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-display text-xs sm:text-sm font-bold text-zinc-950">Data Protection</p>
                  <p className="text-[11px] leading-snug text-zinc-600">
                    Your data is encrypted and access-controlled
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 lg:px-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-[#C8102E] shrink-0">
                  <IdCard className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-display text-xs sm:text-sm font-bold text-zinc-950">Institution Verified</p>
                  <p className="text-[11px] leading-snug text-zinc-600">
                    Only genuine KL University students can join
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 lg:px-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-[#C8102E] shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-display text-xs sm:text-sm font-bold text-zinc-950">Controlled Messaging</p>
                  <p className="text-[11px] leading-snug text-zinc-600">
                    Chat unlocks after mutual connection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 lg:pl-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-[#C8102E] shrink-0">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-display text-xs sm:text-sm font-bold text-zinc-950">No Public Directory</p>
                  <p className="text-[11px] leading-snug text-zinc-600">
                    Your personal details are never publicly visible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet White Footer */}
      <footer className="bg-white py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="space-y-2.5">
            <KluTribeLogo variant="full" surface="light" />
            <p>KL University B.Tech Community · Vaddeswaram, Andhra Pradesh</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#why-klu-tribe" className="hover:text-zinc-950 transition-colors">Community</a>
            <a href="#paths" className="hover:text-zinc-950 transition-colors">Paths</a>
            <a href="#tribe-pass-preview" className="hover:text-zinc-950 transition-colors">Tribe Pass</a>
            <a href="#privacy" className="hover:text-zinc-950 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
