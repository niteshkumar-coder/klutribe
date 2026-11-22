import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, Clock } from 'lucide-react';
import { fetchPublicPassByMemberNumber } from '../lib/kluService';
import { getArchetypeMeta, type StudentPublic } from '../types/klu';
import { TribePassCard } from './TribePassCard';
import { KluTribeLogo } from './KluTribeLogo';
import { StudentAvatar } from './StudentAvatar';

interface PublicPassViewProps {
  memberNumber: string;
  onExit: () => void;
}

export function PublicPassView({ memberNumber, onExit }: PublicPassViewProps) {
  const [student, setStudent] = useState<StudentPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPublicPassByMemberNumber(memberNumber)
      .then((res) => {
        if (active) {
          setStudent(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [memberNumber]);

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-zinc-950 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <KluTribeLogo variant="compact" surface="light" />
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to KLU TRIBE
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs p-8 text-sm text-zinc-600">
            Verifying member pass #{memberNumber}...
          </div>
        ) : !student ? (
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs p-8 space-y-3">
            <h1 className="font-display text-xl font-semibold text-zinc-950">Pass Not Found</h1>
            <p className="text-sm text-zinc-600">
              No active KLU TRIBE member pass was found for identifier <span className="font-mono text-zinc-950">{memberNumber}</span>.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <StudentAvatar
                  name={student.fullName}
                  avatarDataUrl={student.avatarDataUrl}
                  size="lg"
                  shape="rounded"
                  className="border-2 border-white shadow-sm"
                />
                <div className="min-w-0">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950 truncate">
                    {student.fullName}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-600">
                    B.Tech {student.branch} · {student.year} · {getArchetypeMeta(student.primaryCategory).name}
                  </p>
                </div>
              </div>
              {student.verificationStatus === 'verified' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C8102E]">
                  <ShieldCheck className="w-4 h-4" />
                  Institutional ID Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
                  <Clock className="w-4 h-4" />
                  Verification Pending
                </span>
              )}
            </div>

            <TribePassCard student={student} showActions={false} />

            {student.bio && (
              <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs p-5 space-y-2">
                <p className="text-xs text-zinc-500">About Member</p>
                <p className="text-sm leading-relaxed text-zinc-700">{student.bio}</p>
              </div>
            )}

            <p className="text-xs text-zinc-500">
              For student privacy, phone numbers, email addresses, and full university registration IDs are never exposed on public verification links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
