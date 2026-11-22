import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertCircle,
  Share2,
  Pencil,
  Crown,
  Calendar,
  Users,
  Trophy,
} from 'lucide-react';
import { getArchetypeMeta, type StudentPublic } from '../types/klu';
import { isValidAvatarDataUrl } from '../lib/imageUtils';
import { KluTribeLogo } from './KluTribeLogo';
import kluDaylightCampusImg from '../assets/images/klu_daylight_campus_1794679733683.jpg';
import titaniumCardSurfaceImg from '../assets/images/titanium_card_surface_1794551683597.jpg';

interface TribePassCardProps {
  student: StudentPublic;
  compact?: boolean;
  isPreview?: boolean;
  onEditClick?: () => void;
  showActions?: boolean;
  avatarUrl?: string;
}

export function TribePassCard({
  student,
  compact = false,
  isPreview = false,
  onEditClick,
  showActions = true,
  avatarUrl,
}: TribePassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<'card' | 'story' | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);

  const archetype = getArchetypeMeta(student.primaryCategory);
  const publicPassUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?pass=${encodeURIComponent(student.memberNumber)}`
      : `https://klutribe.in/?pass=${student.memberNumber}`;

  const initials =
    student.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'KL';

  const resolvedAvatar =
    avatarUrl || (isValidAvatarDataUrl(student.avatarDataUrl) ? student.avatarDataUrl : '');

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading('card');
    setExportNote(null);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.download = `KLU-TRIBE-${student.memberNumber}.png`;
      link.href = dataUrl;
      link.click();
      setExportNote('Pass PNG downloaded.');
    } catch {
      setExportNote('Export failed. Try again in a desktop browser.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadStory = async () => {
    if (!storyRef.current) return;
    setDownloading('story');
    setExportNote(null);
    try {
      const dataUrl = await toPng(storyRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `KLU-TRIBE-STORY-${student.memberNumber}.png`;
      link.href = dataUrl;
      link.click();
      setExportNote('1080x1920 Story PNG downloaded.');
    } catch {
      setExportNote('Story export failed. Try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicPassUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setExportNote('Copy failed — share URL manually.');
    }
  };

  const handleWhatsAppShare = () => {
    const text = `My KLU TRIBE Digital Student Pass (${archetype.name}) — ${student.memberNumber}. Verify at ${publicPassUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderStatusPill = () => {
    if (isPreview) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#C8102E]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Student Preview
        </span>
      );
    }
    if (student.verificationStatus === 'verified') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#C8102E]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Student
        </span>
      );
    }
    if (student.verificationStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
          <AlertCircle className="w-3.5 h-3.5" />
          ID Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <Clock className="w-3.5 h-3.5" />
        Pending ID Review
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Crisp White + Crimson Diagonal KLU Student Pass */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-3xl border border-zinc-200/90 border-b-[3px] border-b-[#C8102E] bg-white text-zinc-950 select-none shadow-[0_20px_50px_-15px_rgba(17,24,39,0.14)] ${
          compact ? 'p-5' : 'p-6 sm:p-7'
        }`}
      >
        {/* Daylight KL University Campus Backdrop on Right Side (Clear & Crisp) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[68%] overflow-hidden">
          <img
            src={kluDaylightCampusImg}
            alt="KL University campus building"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 via-22% to-transparent" />
        </div>

        {/* Signature Crimson Diagonal Accent Ribbon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 left-[34%] h-44 w-16 rotate-[28deg] bg-gradient-to-b from-[#C8102E]/80 via-[#E11D48]/35 to-transparent"
        />

        <div className="relative z-10 flex flex-col justify-between gap-5">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <KluTribeLogo variant="card" surface="light" />
              <p className="mt-1.5 text-xs font-medium text-zinc-500">
                Digital Tribe Pass · Batch {student.batch}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-gradient-to-r from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D] px-3 py-1 text-xs font-semibold text-amber-950 shadow-xs shrink-0">
              <Crown className="w-3.5 h-3.5 text-amber-700" />
              {student.verificationStatus === 'verified' ? 'Verified Member' : 'Tribe Member'}
            </div>
          </div>

          {/* Body: Photo + Identity + Path Metadata + QR */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 items-end">
            {/* Student Portrait + Basic Identity */}
            <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-zinc-100 shadow-md">
                {resolvedAvatar ? (
                  <img
                    src={resolvedAvatar}
                    alt={student.fullName}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C8102E] to-[#881337] font-display text-2xl font-bold tracking-tight text-white">
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <h3 className="font-display text-xl font-bold tracking-tight text-zinc-950 truncate">
                  {student.fullName}
                </h3>
                <p className="text-xs font-medium text-zinc-600">
                  B.Tech — {student.branch}
                </p>
                <p className="font-mono text-xs tabular-nums text-zinc-500">
                  ID {student.maskedStudentId}
                </p>
                <div className="pt-1">{renderStatusPill()}</div>
              </div>
            </div>

            {/* Clean Icon Metadata Rows (Frosted Light Backing for Clarity over Campus Photo) */}
            <div className="flex flex-col items-start gap-2 border-t md:border-t-0 md:border-l border-zinc-200/80 pt-4 md:pt-0 md:pl-5">
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-zinc-200/70 bg-white/95 backdrop-blur-xs px-3 py-1.5 text-xs sm:text-sm text-zinc-900 shadow-xs">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-[#C8102E]" />
                </span>
                <span className="font-semibold">{student.year}</span>
              </div>

              <div className="inline-flex items-center gap-2.5 rounded-xl border border-zinc-200/70 bg-white/95 backdrop-blur-xs px-3 py-1.5 text-xs sm:text-sm text-zinc-900 shadow-xs">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 shrink-0">
                  <Users className="w-3.5 h-3.5 text-[#C8102E]" />
                </span>
                <span className="font-semibold">KLU TRIBE Member</span>
              </div>

              <div className="inline-flex items-center gap-2.5 rounded-xl border border-rose-200/90 bg-rose-50/95 backdrop-blur-xs px-3 py-1.5 text-xs sm:text-sm text-[#C8102E] shadow-xs">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-rose-100 shrink-0">
                  <Trophy className="w-3.5 h-3.5 text-[#C8102E]" />
                </span>
                <span className="font-bold">
                  {archetype.name} ({archetype.subtitle})
                </span>
              </div>

              {!compact && student.skills.length > 0 && (
                <div className="mt-0.5 rounded-xl border border-zinc-200/80 bg-white/95 backdrop-blur-xs px-3 py-2 shadow-xs">
                  <p className="text-xs text-zinc-800 leading-relaxed">
                    <span className="font-bold text-zinc-950">Core Skills:</span>{' '}
                    {student.skills.slice(0, 5).join(' · ')}
                  </p>
                </div>
              )}
            </div>

            {/* Safe Public QR Code + Crisp White Member Number Pill */}
            <div className="flex md:flex-col items-center md:items-center justify-between gap-2 shrink-0">
              <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 shadow-md">
                <QRCodeSVG
                  value={publicPassUrl}
                  size={compact ? 74 : 98}
                  bgColor="#FFFFFF"
                  fgColor="#111827"
                  level="M"
                />
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white/95 backdrop-blur-xs px-3 py-1 shadow-sm text-center">
                <p className="font-mono text-xs font-bold tabular-nums text-zinc-950">
                  #{student.memberNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {showActions && !isPreview && (
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={downloading !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading === 'card' ? 'Exporting...' : 'Download PNG'}
          </button>

          <button
            type="button"
            onClick={handleDownloadStory}
            disabled={downloading !== null}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading === 'story' ? 'Rendering 1080x1920...' : 'Instagram Story (1080×1920)'}
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp Status
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied' : 'Public Link'}
          </button>

          <a
            href={`/?pass=${encodeURIComponent(student.memberNumber)}` }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Verify View
          </a>

          {onEditClick && (
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              Update Card
            </button>
          )}
        </div>
      )}

      {exportNote && <p className="text-xs text-zinc-600">{exportNote}</p>}

      {/* Off-screen 1080x1920 Instagram Story Render Target */}
      {!isPreview && (
        <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
          <div
            ref={storyRef}
            style={{ width: '1080px', height: '1920px' }}
            className="relative flex flex-col justify-between bg-[#09090B] p-20 text-[#F5F5F5]"
          >
            <img
              src={titaniumCardSurfaceImg}
              alt=""
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/65 via-[#141417]/45 to-[#09090B]/70" />
            <div
              className="absolute top-0 left-0 right-0 h-3"
              style={{ backgroundColor: archetype.accentHex }}
            />

            <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-12">
              <div>
                <KluTribeLogo variant="story" surface="dark" />
                <p className="mt-4 text-2xl text-zinc-400">KL University · Vaddeswaram</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl text-zinc-300">BATCH {student.batch}</p>
                <p className="mt-2 text-2xl font-medium" style={{ color: archetype.accentHex }}>
                  {student.verificationStatus === 'verified' ? 'KLU Verified Member' : 'Member Pass'}
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-14">
              <div className="flex items-center gap-10">
                <div className="h-44 w-44 shrink-0 overflow-hidden rounded-3xl border-4 border-white/25 bg-zinc-900 shadow-2xl">
                  {resolvedAvatar ? (
                    <img
                      src={resolvedAvatar}
                      alt={student.fullName}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#C8102E] to-[#881337] font-display text-6xl font-bold text-white">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-2xl text-zinc-400">Student Member</p>
                  <h2 className="mt-3 font-display text-7xl font-bold tracking-tight leading-tight">
                    {student.fullName}
                  </h2>
                  <p className="mt-5 text-3xl text-zinc-300">
                    B.Tech {student.branch} · {student.year}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/15 pt-12">
                <p className="text-2xl text-zinc-400">Selected Archetype</p>
                <p
                  className="mt-3 font-display text-5xl font-bold tracking-tight"
                  style={{ color: archetype.accentHex }}
                >
                  {archetype.name}
                </p>
                <p className="mt-4 text-3xl text-zinc-300">{archetype.motto}</p>
              </div>

              {student.skills.length > 0 && (
                <div className="border-t border-white/15 pt-12">
                  <p className="text-2xl text-zinc-400">Capabilities</p>
                  <p className="mt-4 text-3xl leading-relaxed text-zinc-200">
                    {student.skills.slice(0, 6).join(' · ')}
                  </p>
                </div>
              )}
            </div>

            <div className="relative z-10 flex items-end justify-between border-t border-white/15 pt-12">
              <div>
                <p className="text-2xl text-zinc-400">Member Identifier</p>
                <p className="mt-2 font-mono text-4xl font-semibold tabular-nums">
                  #{student.memberNumber}
                </p>
                <p className="mt-3 text-xl text-zinc-500">Your Campus. Your People. Your Future.</p>
              </div>
              <div className="rounded-3xl bg-white p-5">
                <QRCodeSVG value={publicPassUrl} size={200} bgColor="#FFFFFF" fgColor="#09090B" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
