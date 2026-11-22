import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const envAuthDomain =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN
    ? String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN).trim()
    : '';

const isRunAppPreview =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.run.app');

const resolvedConfig =
  envAuthDomain && !isRunAppPreview
    ? { ...firebaseConfig, authDomain: envAuthDomain }
    : firebaseConfig;

const app = initializeApp(resolvedConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const isSameOriginAuth =
  typeof window !== 'undefined' &&
  resolvedConfig.authDomain.toLowerCase() === window.location.hostname.toLowerCase();
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

type AuthWithResolver = typeof auth & {
  _popupRedirectResolver?: {
    _initialize?: (instance: typeof auth) => Promise<unknown>;
  };
};

export const STUDENT_AUTH_DOMAIN = 'student.klutribe.in';

export function normalizeStudentId(rawId: string): string {
  return rawId.trim().toUpperCase();
}

export function isValidStudentIdFormat(rawId: string): boolean {
  return /^[a-zA-Z0-9]{6,20}$/.test(rawId.trim());
}

export function studentIdToAuthEmail(studentId: string): string {
  return `${studentId.trim().toLowerCase()}@${STUDENT_AUTH_DOMAIN}`;
}

export function isStudentIdAuthEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(`@${STUDENT_AUTH_DOMAIN}`);
}

export function extractStudentIdFromAuthEmail(email: string | null | undefined): string {
  if (!isStudentIdAuthEmail(email)) return '';
  return (email || '').trim().split('@')[0].toUpperCase();
}

export function prewarmGooglePopup(): void {
  if (typeof window === 'undefined') return;
  const resolver = (auth as AuthWithResolver)._popupRedirectResolver;
  if (resolver && typeof resolver._initialize === 'function') {
    void resolver._initialize(auth).catch(() => null);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
      return false;
    }
    return true;
  }
}
