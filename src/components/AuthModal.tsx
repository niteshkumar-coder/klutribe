import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  RefreshCw,
  X,
} from 'lucide-react';
import { isValidStudentIdFormat } from '../lib/firebase';
import { KluTribeLogo } from './KluTribeLogo';

interface AuthModalProps {
  open: boolean;
  initialStudentId?: string;
  signingIn: boolean;
  error: string | null;
  canRetryGoogle: boolean;
  canRedirectGoogle: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
  onGoogleRedirectFallback: () => void;
  onStudentIdAuth: (payload: {
    studentId: string;
    password: string;
  }) => Promise<void>;
  onClearError: () => void;
}

export function AuthModal({
  open,
  initialStudentId = '',
  signingIn,
  error,
  canRetryGoogle,
  canRedirectGoogle,
  onClose,
  onGoogleSignIn,
  onGoogleRedirectFallback,
  onStudentIdAuth,
  onClearError,
}: AuthModalProps) {
  const [studentId, setStudentId] = useState(initialStudentId);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLocalError(null);
      setPassword('');
      setShowPassword(false);
      if (initialStudentId) {
        setStudentId(initialStudentId.trim().toUpperCase());
      }
    }
  }, [open, initialStudentId]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !signingIn) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, signingIn, onClose]);

  if (!open) return null;

  const displayError = localError || error;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    onClearError();

    const cleanId = studentId.trim().toUpperCase();
    if (!isValidStudentIdFormat(cleanId)) {
      setLocalError('Enter a valid University Student ID (6–20 letters or digits, no spaces).');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (password.length > 128) {
      setLocalError('Password must be 128 characters or fewer.');
      return;
    }

    await onStudentIdAuth({
      studentId: cleanId,
      password,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!signingIn) onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 pt-6 pb-4">
          <div className="space-y-1.5">
            <KluTribeLogo variant="compact" surface="light" />
            <h2
              id="auth-modal-title"
              className="font-display text-xl font-extrabold tracking-tight text-zinc-950 pt-1"
            >
              Join or Login to KLU TRIBE
            </h2>
            <p className="text-xs text-zinc-600">
              Continue using your University Student ID &amp; Password or directly with Google.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={signingIn}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors disabled:opacity-50"
            aria-label="Close sign in dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {displayError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700 space-y-2">
              <p className="font-medium leading-relaxed">{displayError}</p>
              {(canRetryGoogle || canRedirectGoogle) && (
                <div className="flex flex-wrap items-center gap-2">
                  {canRetryGoogle && (
                    <button
                      type="button"
                      onClick={onGoogleSignIn}
                      disabled={signingIn}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8102E] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#A30D25] transition-colors disabled:opacity-60"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry Google Sign-In
                    </button>
                  )}
                  {canRedirectGoogle && (
                    <button
                      type="button"
                      onClick={onGoogleRedirectFallback}
                      disabled={signingIn}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-60"
                    >
                      Try Redirect Login
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Option 1: University Student ID & Password */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <p className="text-xs font-bold text-zinc-800">
              1. University Student ID &amp; Password
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor="auth-student-id"
                className="text-xs font-medium text-zinc-700"
              >
                University Student ID Number *
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-student-id"
                  type="text"
                  required
                  autoComplete="username"
                  maxLength={20}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. 2400031042"
                  disabled={signingIn}
                  className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-3.5 py-2.5 font-mono text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none disabled:bg-zinc-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="auth-password"
                className="text-xs font-medium text-zinc-700"
              >
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  maxLength={128}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter or create KLU TRIBE password"
                  disabled={signingIn}
                  className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-10 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-[#C8102E] focus:outline-none disabled:bg-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Already registered? Enter your University ID &amp; password to automatically open your existing profile. First time here? Set a password to register.
              </p>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8102E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#A30D25] transition-colors disabled:opacity-60"
            >
              {signingIn ? 'Please wait...' : 'Continue with University ID'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Clean Divider */}
          <div className="relative flex items-center py-0.5">
            <div className="flex-grow border-t border-zinc-200" />
            <span className="mx-3 shrink-0 text-[11px] font-medium text-zinc-400">
              OR
            </span>
            <div className="flex-grow border-t border-zinc-200" />
          </div>

          {/* Option 2: Direct Google */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-800">
              2. Direct with Google
            </p>
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={signingIn}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-2xs hover:border-zinc-400 hover:bg-zinc-50 transition-colors disabled:opacity-60"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29A7.19 7.19 0 0 1 4.9 12c0-.79.14-1.56.38-2.29v-3.1H1.28a12 12 0 0 0 0 10.78l4-3.1Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1C6.23 6.86 8.88 4.75 12 4.75Z"
                />
              </svg>
              {signingIn ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
