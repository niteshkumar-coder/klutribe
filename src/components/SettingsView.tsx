import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Lock, Save, Trash2, Upload } from 'lucide-react';
import { auth, isStudentIdAuthEmail } from '../lib/firebase';
import { processProfilePhotoFile } from '../lib/imageUtils';
import {
  fetchStudentPrivate,
  updateStudentPrivateInfo,
  updateStudentProfile,
} from '../lib/kluService';
import { StudentAvatar } from './StudentAvatar';
import {
  ACADEMIC_YEARS,
  ARCHETYPES,
  BRANCHES,
  CURATED_SKILLS,
  NINETY_DAYS_MS,
  SECONDARY_INTERESTS,
  type AcademicYear,
  type ArchetypeId,
  type Branch,
  type CampusMode,
  type GenderOption,
  type StudentPrivate,
  type StudentPublic,
} from '../types/klu';

interface SettingsViewProps {
  me: StudentPublic;
}

export function SettingsView({ me }: SettingsViewProps) {
  const [fullName, setFullName] = useState(me.fullName);
  const [branch, setBranch] = useState<Branch>(me.branch);
  const [year, setYear] = useState<AcademicYear>(me.year);
  const [bio, setBio] = useState(me.bio);
  const [careerGoal, setCareerGoal] = useState(me.careerGoal);
  const [skills, setSkills] = useState<string[]>(me.skills);
  const [secondaryInterests, setSecondaryInterests] = useState<string[]>(me.secondaryInterests);
  const [primaryCategory, setPrimaryCategory] = useState<ArchetypeId>(me.primaryCategory);
  const [startupInterest, setStartupInterest] = useState(me.startupInterest);
  const [startupIdeaSummary, setStartupIdeaSummary] = useState(me.startupIdeaSummary);
  const [campusMode, setCampusMode] = useState<CampusMode>(me.campusMode);
  const [allowConnections, setAllowConnections] = useState(me.allowConnections);
  const [avatarDataUrl, setAvatarDataUrl] = useState(me.avatarDataUrl || '');
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [privateInfo, setPrivateInfo] = useState<StudentPrivate | null>(null);
  const [phone, setPhone] = useState('');
  const [kluStudentId, setKluStudentId] = useState('');
  const [gender, setGender] = useState<GenderOption>('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setAvatarDataUrl(me.avatarDataUrl || '');
  }, [me.avatarDataUrl]);

  const msSinceLastCategoryChange = Date.now() - (me.categoryUpdatedAtMs || 0);
  const canSwitchCategory = msSinceLastCategoryChange >= NINETY_DAYS_MS || me.categoryUpdatedAtMs === 0;
  const daysRemaining = Math.max(
    0,
    Math.ceil((NINETY_DAYS_MS - msSinceLastCategoryChange) / (24 * 60 * 60 * 1000))
  );

  useEffect(() => {
    fetchStudentPrivate(me.uid).then((priv) => {
      if (priv) {
        setPrivateInfo(priv);
        setPhone(priv.phone);
        setKluStudentId(priv.kluStudentId);
        setGender(priv.gender);
      }
    });
  }, [me.uid]);

  const toggleSkill = (sk: string) => {
    setSkills((prev) =>
      prev.includes(sk) ? prev.filter((s) => s !== sk) : prev.length < 15 ? [...prev, sk] : prev
    );
  };

  const toggleSecondary = (item: string) => {
    setSecondaryInterests((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : prev.length < 5 ? [...prev, item] : prev
    );
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoUploading(true);
    setErrorMessage(null);
    setMessage(null);
    try {
      const processed = await processProfilePhotoFile(file);
      setAvatarDataUrl(processed);
      await updateStudentProfile(me.uid, { avatarDataUrl: processed });
      setMessage('Profile photo updated across your Profile, Tribe Pass card, and badge.');
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to upload profile photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoUploading(true);
    setErrorMessage(null);
    setMessage(null);
    try {
      setAvatarDataUrl('');
      await updateStudentProfile(me.uid, { avatarDataUrl: '' });
      setMessage('Profile photo removed.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to remove profile photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSavePublic = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const categoryChanged = primaryCategory !== me.primaryCategory;
      await updateStudentProfile(me.uid, {
        fullName,
        branch,
        year,
        bio,
        careerGoal,
        skills,
        secondaryInterests,
        startupInterest,
        startupIdeaSummary,
        campusMode,
        allowConnections,
        avatarDataUrl,
        ...(categoryChanged && canSwitchCategory
          ? { primaryCategory, categoryUpdatedAtMs: Date.now() }
          : {}),
      });
      setMessage('Profile & privacy settings saved.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to save public settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const authMethod = isStudentIdAuthEmail(auth.currentUser?.email) ? 'student_id' : 'google';
      await updateStudentPrivateInfo(me.uid, { phone, kluStudentId, gender }, authMethod);
      setMessage('Private PII details updated securely.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to update private details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">Profile & Privacy Settings</h1>
        <p className="text-sm text-zinc-600">
          Update your public Tribe Pass, manage skills, switch your 90-day archetype path, or edit private contact fields.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSavePublic} className="rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-6 shadow-xs">
        <h2 className="font-display text-lg font-semibold text-zinc-950">Public Profile & Path</h2>

        {/* Profile & Tribe Pass Photo */}
        <div className="rounded-2xl border border-zinc-200 bg-[#FAFAFA] p-4 flex flex-col sm:flex-row items-center gap-4">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={photoUploading}
            className="relative group rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
            aria-label="Change profile photo"
          >
            <StudentAvatar
              name={fullName || me.fullName}
              avatarDataUrl={avatarDataUrl}
              size="xl"
              shape="rounded"
              className="border-2 border-white shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C8102E] text-white shadow-sm group-hover:scale-105 transition-transform">
              <Camera className="w-3.5 h-3.5" />
            </span>
          </button>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <p className="text-xs font-bold text-zinc-900">
                Profile, Tribe Pass Card &amp; Badge Photo
              </p>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                Upload a clear portrait photo (JPG, PNG or WebP). It updates immediately on your Profile, Tribe Pass card, and campus badges.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8102E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#A30D25] transition-colors disabled:opacity-60"
              >
                <Upload className="w-3.5 h-3.5" />
                {photoUploading
                  ? 'Uploading...'
                  : avatarDataUrl
                    ? 'Change Photo'
                    : 'Upload Photo'}
              </button>
              {avatarDataUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoUploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-red-300 hover:text-[#C8102E] transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Full Name</label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value as Branch)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value as AcademicYear)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">Bio</label>
          <textarea
            rows={2}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">Career Goal</label>
          <input
            type="text"
            maxLength={200}
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
          />
        </div>

        <div className="space-y-2 border-t border-zinc-200 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-700">Primary Archetype</label>
            <span className="text-xs text-zinc-500">
              {canSwitchCategory
                ? 'Eligible to switch now'
                : `Next switch available in ${daysRemaining} days`}
            </span>
          </div>
          <select
            value={primaryCategory}
            disabled={!canSwitchCategory}
            onChange={(e) => setPrimaryCategory(e.target.value as ArchetypeId)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
          >
            {ARCHETYPES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.index}. {a.name} ({a.subtitle})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-700">Secondary Interests</label>
          <div className="flex flex-wrap gap-1.5">
            {SECONDARY_INTERESTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleSecondary(item)}
                className={`rounded-lg border px-2.5 py-1 text-xs ${
                  secondaryInterests.includes(item)
                    ? 'border-[#C8102E] bg-rose-50 text-[#C8102E] font-medium'
                    : 'border-zinc-200 bg-[#FAFAFA] text-zinc-600 hover:border-zinc-300 hover:text-zinc-950'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-700">Skills</label>
          <div className="flex flex-wrap gap-1.5">
            {CURATED_SKILLS.map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => toggleSkill(sk)}
                className={`rounded-lg border px-2.5 py-1 text-xs ${
                  skills.includes(sk)
                    ? 'border-[#C8102E] bg-rose-50 text-[#C8102E] font-medium'
                    : 'border-zinc-200 bg-[#FAFAFA] text-zinc-600 hover:border-zinc-300 hover:text-zinc-950'
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Campus Mode (Opt-in Directory Filter)</label>
            <select
              value={campusMode}
              onChange={(e) => setCampusMode(e.target.value as CampusMode)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              <option value="">Keep Private</option>
              <option value="Hosteller">Hosteller</option>
              <option value="Day Scholar">Day Scholar</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={allowConnections}
                onChange={(e) => setAllowConnections(e.target.checked)}
                className="h-4 w-4 accent-[#C8102E]"
              />
              Allow peers to send connection requests
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={startupInterest}
              onChange={(e) => setStartupInterest(e.target.checked)}
              className="h-4 w-4 accent-[#C8102E]"
            />
            Show me in Startup Co-founder Matching
          </label>
          {startupInterest && (
            <input
              type="text"
              maxLength={280}
              value={startupIdeaSummary}
              onChange={(e) => setStartupIdeaSummary(e.target.value)}
              placeholder="1-line startup focus"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#C8102E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#A30D25]"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Public Settings'}
        </button>
      </form>

      {/* Isolated PII Form */}
      <form onSubmit={handleSavePrivate} className="rounded-2xl border border-zinc-200/90 bg-white p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#C8102E]" />
          <h2 className="font-display text-lg font-semibold text-zinc-950">Private Identity Vault (Never Public)</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Google Email (Read-only)</label>
            <input
              type="text"
              disabled
              value={privateInfo?.email || 'Loading...'}
              className="w-full rounded-xl border border-zinc-200 bg-[#FAFAFA] px-3 py-2 text-xs text-zinc-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Mobile Number</label>
            <input
              type="tel"
              required
              minLength={10}
              maxLength={16}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Full KLU Student ID</label>
            <input
              type="text"
              required
              minLength={6}
              maxLength={20}
              value={kluStudentId}
              onChange={(e) => setKluStudentId(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Gender (Optional)</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderOption)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-[#C8102E] focus:outline-none"
            >
              <option value="">Prefer not to say / Skip</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-800 hover:border-[#C8102E] hover:text-[#C8102E]"
        >
          Update Private Info
        </button>
      </form>
    </div>
  );
}
