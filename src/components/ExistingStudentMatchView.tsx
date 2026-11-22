import { ArrowRight, CheckCircle2, IdCard, LogOut, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { getArchetypeMeta, type StudentIdRegistryRecord, type StudentPublic } from '../types/klu';
import { KluTribeLogo } from './KluTribeLogo';
import { TribePassCard } from './TribePassCard';

interface ExistingStudentMatchViewProps {
  registry: StudentIdRegistryRecord;
  existingProfile: StudentPublic | null;
  switching: boolean;
  onContinueOriginalAuth: () => void;
  onSignOutAndRetry: () => void;
}

export function ExistingStudentMatchView({
  registry,
  existingProfile,
  switching,
  onContinueOriginalAuth,
  onSignOutAndRetry,
}: ExistingStudentMatchViewProps) {
  const archetype = existingProfile ? getArchetypeMeta(existingProfile.primaryCategory) : null;

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#0B0F19] pb-14">
      <header className="border-b border-zinc-200/80 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <KluTribeLogo variant="compact" surface="light" />
          <button
            type="button"
            onClick={onSignOutAndRetry}
            disabled={switching}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-800 hover:border-rose-200 hover:text-[#C8102E] transition-colors disabled:opacity-60"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Existing Profile Found Banner */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-rose-50/40 p-5 sm:p-7 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.14)] space-y-4">
          <div className="flex items-start gap-3.5">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-bold text-white">
                  Existing Profile Found
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-zinc-800">
                  <IdCard className="w-3.5 h-3.5 text-[#C8102E]" />
                  {registry.kluStudentId}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B0F19]">
                Welcome back, {existingProfile?.fullName || registry.fullName}!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                This KL University Student ID (<strong className="font-mono text-zinc-900">{registry.kluStudentId}</strong>) is already registered on KLU TRIBE. Your existing profile is shown automatically below so no duplicate account is created.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-3 flex items-start gap-2.5 text-xs text-zinc-700">
            <ShieldCheck className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
            <span>
              {registry.authMethod === 'google' ? (
                <>
                  This profile was originally created using <strong>Google Sign-In</strong>. Click below to sign in with your registered Google account and unlock your full dashboard, messages, and settings.
                </>
              ) : (
                <>
                  This profile was originally created using <strong>University Student ID &amp; Password</strong>. Click below to log in with your Student ID password and unlock your full dashboard, messages, and settings.
                </>
              )}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onContinueOriginalAuth}
              disabled={switching}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DC143C] via-[#C8102E] to-[#A60C25] px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-[0_12px_24px_-8px_rgba(200,16,46,0.45)] hover:brightness-105 transition-all disabled:opacity-60"
            >
              <span>
                {switching
                  ? 'Opening your account...'
                  : registry.authMethod === 'google'
                    ? 'Continue with Registered Google Account'
                    : `Login with Student ID (${registry.kluStudentId})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onSignOutAndRetry}
              disabled={switching}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors disabled:opacity-60"
            >
              Use Different ID
            </button>
          </div>
        </div>

        {/* Automatic Display of Existing Tribe Pass & Saved Public Details */}
        {existingProfile ? (
          <div className="space-y-5">
            <TribePassCard student={existingProfile} showActions={false} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 space-y-2 shadow-xs">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-[#C8102E]" />
                  Saved Path &amp; Goal
                </p>
                {archetype && (
                  <p className="font-display text-base font-bold" style={{ color: archetype.accentHex }}>
                    {archetype.subtitle} · {archetype.name}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  {existingProfile.careerGoal || 'Goal saved in profile'}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 space-y-2 shadow-xs">
                <p className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#C8102E]" />
                  Saved Skills &amp; Bio
                </p>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {existingProfile.bio || 'Bio saved in profile'}
                </p>
                {existingProfile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {existingProfile.skills.slice(0, 8).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-rose-200 bg-[#FFF4F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#C8102E]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-1.5 shadow-xs">
            <p className="text-xs font-semibold text-[#C8102E] font-mono">#{registry.memberNumber}</p>
            <p className="font-display text-lg font-bold text-zinc-950">{registry.fullName}</p>
            <p className="text-xs text-zinc-600">
              B.Tech {registry.branch} · {registry.year}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
