import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  ADMIN_BOOTSTRAP_EMAIL,
  type AcademicYear,
  type ArchetypeId,
  type AuditLog,
  type Branch,
  type CampusEvent,
  type CampusMode,
  type CampusSection,
  type Connection,
  type ContentReport,
  type DirectMessage,
  type GenderOption,
  type Opportunity,
  type OpportunityCategory,
  type ProjectTeam,
  type RoadmapYear,
  type SkillExchange,
  type StartupIdea,
  type StudentIdRegistryRecord,
  type StudentPrivate,
  type StudentPublic,
  type VerificationStatus,
} from '../types/klu';

export function clampStr(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export function maskStudentId(rawId: string): string {
  const cleaned = rawId.trim().toUpperCase();
  if (cleaned.length <= 4) return '••••';
  if (cleaned.length <= 6) return `${cleaned.slice(0, 2)}••${cleaned.slice(-2)}`;
  return `${cleaned.slice(0, 4)}••••${cleaned.slice(-2)}`;
}

export function computeBatchFromYear(year: AcademicYear): string {
  const currentYear = 2026;
  const offsetMap: Record<AcademicYear, number> = {
    '1st Year': 0,
    '2nd Year': 1,
    '3rd Year': 2,
    '4th Year': 3,
  };
  const start = currentYear - offsetMap[year];
  return `${start}–${start + 4}`;
}

export function generateMemberNumber(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i += 1) {
    hash = (hash * 31 + uid.charCodeAt(i)) % 900000;
  }
  const num = 100000 + Math.abs(hash);
  return `KLU-${String(num).slice(0, 6)}`;
}

export function makeSafeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export async function checkIsAdmin(
  _uid: string,
  email: string | null,
  emailVerified = true
): Promise<boolean> {
  if (!emailVerified || !email) return false;
  return email.trim().toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
}

export async function fetchPublicPassByMemberNumber(memberNumber: string): Promise<StudentPublic | null> {
  const path = 'students';
  try {
    const q = query(
      collection(db, path),
      where('isSuspended', '==', false),
      where('memberNumber', '==', memberNumber.trim().toUpperCase())
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as StudentPublic;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchStudentProfile(uid: string): Promise<StudentPublic | null> {
  const path = `students/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'students', uid));
    return snap.exists() ? (snap.data() as StudentPublic) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function fetchStudentPrivate(uid: string): Promise<StudentPrivate | null> {
  const path = `students/${uid}/private/info`;
  try {
    const snap = await getDoc(doc(db, 'students', uid, 'private', 'info'));
    return snap.exists() ? (snap.data() as StudentPrivate) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeMyStudentProfile(
  uid: string,
  onData: (profile: StudentPublic | null) => void
): Unsubscribe {
  const path = `students/${uid}`;
  return onSnapshot(
    doc(db, 'students', uid),
    (snap) => {
      onData(snap.exists() ? (snap.data() as StudentPublic) : null);
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export async function lookupStudentIdRegistry(
  rawStudentId: string
): Promise<StudentIdRegistryRecord | null> {
  const cleanId = rawStudentId.trim().toUpperCase();
  if (!/^[A-Z0-9]{6,20}$/.test(cleanId)) return null;
  const path = `studentIdRegistry/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'studentIdRegistry', cleanId));
    return snap.exists() ? (snap.data() as StudentIdRegistryRecord) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function ensureStudentIdRegistryForProfile(
  student: StudentPublic,
  rawStudentId: string,
  authMethod: 'google' | 'student_id'
): Promise<void> {
  const cleanId = clampStr(rawStudentId.toUpperCase(), 20);
  if (!/^[A-Z0-9]{6,20}$/.test(cleanId)) return;
  try {
    const ref = doc(db, 'studentIdRegistry', cleanId);
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) return;
    const now = serverTimestamp();
    await setDoc(ref, {
      kluStudentId: cleanId,
      ownerUid: student.uid,
      memberNumber: student.memberNumber,
      fullName: clampStr(student.fullName, 80),
      branch: student.branch,
      year: student.year,
      authMethod,
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    // Best-effort silent backfill; ignore if already claimed or offline
  }
}

export interface OnboardingPayload {
  uid: string;
  email: string;
  authMethod: 'google' | 'student_id';
  fullName: string;
  kluStudentId: string;
  branch: Branch;
  year: AcademicYear;
  phone: string;
  gender: GenderOption;
  campusMode: CampusMode;
  primaryCategory: ArchetypeId;
  secondaryInterests: string[];
  skills: string[];
  bio: string;
  careerGoal: string;
  startupInterest: boolean;
  startupIdeaSummary: string;
  roadmap: RoadmapYear[];
}

export async function createStudentAccount(payload: OnboardingPayload): Promise<void> {
  const publicPath = `students/${payload.uid}`;
  const cleanKluId = clampStr(payload.kluStudentId.toUpperCase(), 20);

  const existingRegistry = await lookupStudentIdRegistry(cleanKluId);
  if (existingRegistry && existingRegistry.ownerUid !== payload.uid) {
    throw new Error(
      `This KL University Student ID (${cleanKluId}) is already registered under an existing KLU TRIBE profile.`
    );
  }

  try {
    const batch = writeBatch(db);
    const now = serverTimestamp();
    const memberNumber = generateMemberNumber(payload.uid);

    const publicDoc: Record<string, unknown> = {
      uid: payload.uid,
      memberNumber,
      maskedStudentId: maskStudentId(cleanKluId),
      fullName: clampStr(payload.fullName, 80),
      branch: payload.branch,
      year: payload.year,
      batch: computeBatchFromYear(payload.year),
      primaryCategory: payload.primaryCategory,
      secondaryInterests: payload.secondaryInterests.slice(0, 5),
      skills: payload.skills.slice(0, 15),
      bio: clampStr(payload.bio, 500),
      careerGoal: clampStr(payload.careerGoal, 200),
      startupInterest: Boolean(payload.startupInterest),
      startupIdeaSummary: clampStr(payload.startupIdeaSummary, 280),
      campusMode: payload.campusMode,
      verificationStatus: 'pending_review' satisfies VerificationStatus,
      isSuspended: false,
      allowConnections: true,
      roadmap: payload.roadmap.slice(0, 4),
      categoryUpdatedAtMs: Date.now(),
      createdAt: now,
      updatedAt: now,
    };

    const privateDoc: Record<string, unknown> = {
      uid: payload.uid,
      email: clampStr(payload.email, 160),
      phone: clampStr(payload.phone, 16),
      kluStudentId: cleanKluId,
      gender: payload.gender,
      createdAt: now,
      updatedAt: now,
    };

    const registryDoc: Record<string, unknown> = {
      kluStudentId: cleanKluId,
      ownerUid: payload.uid,
      memberNumber,
      fullName: clampStr(payload.fullName, 80),
      branch: payload.branch,
      year: payload.year,
      authMethod: payload.authMethod,
      createdAt: now,
      updatedAt: now,
    };

    batch.set(doc(db, 'students', payload.uid), publicDoc);
    batch.set(doc(db, 'students', payload.uid, 'private', 'info'), privateDoc);
    if (!existingRegistry) {
      batch.set(doc(db, 'studentIdRegistry', cleanKluId), registryDoc);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, publicPath);
  }
}

export async function updateStudentProfile(
  uid: string,
  updates: Partial<
    Pick<
      StudentPublic,
      | 'fullName'
      | 'maskedStudentId'
      | 'branch'
      | 'year'
      | 'batch'
      | 'primaryCategory'
      | 'secondaryInterests'
      | 'skills'
      | 'bio'
      | 'careerGoal'
      | 'startupInterest'
      | 'startupIdeaSummary'
      | 'campusMode'
      | 'allowConnections'
      | 'roadmap'
      | 'categoryUpdatedAtMs'
    >
  >
): Promise<void> {
  const path = `students/${uid}`;
  try {
    const sanitized: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (updates.fullName !== undefined) sanitized.fullName = clampStr(updates.fullName, 80);
    if (updates.maskedStudentId !== undefined) sanitized.maskedStudentId = clampStr(updates.maskedStudentId, 20);
    if (updates.branch !== undefined) sanitized.branch = updates.branch;
    if (updates.year !== undefined) {
      sanitized.year = updates.year;
      sanitized.batch = computeBatchFromYear(updates.year);
    }
    if (updates.primaryCategory !== undefined) sanitized.primaryCategory = updates.primaryCategory;
    if (updates.secondaryInterests !== undefined) sanitized.secondaryInterests = updates.secondaryInterests.slice(0, 5);
    if (updates.skills !== undefined) sanitized.skills = updates.skills.slice(0, 15);
    if (updates.bio !== undefined) sanitized.bio = clampStr(updates.bio, 500);
    if (updates.careerGoal !== undefined) sanitized.careerGoal = clampStr(updates.careerGoal, 200);
    if (updates.startupInterest !== undefined) sanitized.startupInterest = Boolean(updates.startupInterest);
    if (updates.startupIdeaSummary !== undefined) sanitized.startupIdeaSummary = clampStr(updates.startupIdeaSummary, 280);
    if (updates.campusMode !== undefined) sanitized.campusMode = updates.campusMode;
    if (updates.allowConnections !== undefined) sanitized.allowConnections = Boolean(updates.allowConnections);
    if (updates.roadmap !== undefined) sanitized.roadmap = updates.roadmap.slice(0, 4);
    if (updates.categoryUpdatedAtMs !== undefined) sanitized.categoryUpdatedAtMs = updates.categoryUpdatedAtMs;

    await updateDoc(doc(db, 'students', uid), sanitized);

    // Best-effort sync to studentIdRegistry if display fields changed
    if (updates.fullName !== undefined || updates.branch !== undefined || updates.year !== undefined) {
      try {
        const privSnap = await getDoc(doc(db, 'students', uid, 'private', 'info'));
        if (privSnap.exists()) {
          const cleanId = String((privSnap.data() as StudentPrivate).kluStudentId || '')
            .trim()
            .toUpperCase();
          if (/^[A-Z0-9]{6,20}$/.test(cleanId)) {
            const regRef = doc(db, 'studentIdRegistry', cleanId);
            const regSnap = await getDoc(regRef);
            if (regSnap.exists() && (regSnap.data() as StudentIdRegistryRecord).ownerUid === uid) {
              const regPatch: Record<string, unknown> = { updatedAt: serverTimestamp() };
              if (updates.fullName !== undefined) regPatch.fullName = clampStr(updates.fullName, 80);
              if (updates.branch !== undefined) regPatch.branch = updates.branch;
              if (updates.year !== undefined) regPatch.year = updates.year;
              await updateDoc(regRef, regPatch);
            }
          }
        }
      } catch {
        // Non-blocking registry metadata sync
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateStudentPrivateInfo(
  uid: string,
  updates: { phone: string; kluStudentId: string; gender: GenderOption },
  authMethod: 'google' | 'student_id' = 'google'
): Promise<void> {
  const path = `students/${uid}/private/info`;
  const cleanId = clampStr(updates.kluStudentId.toUpperCase(), 20);
  if (!/^[A-Z0-9]{6,20}$/.test(cleanId)) {
    throw new Error('Enter a valid KL University Student ID (6–20 alphanumeric characters).');
  }

  const prevPrivSnap = await getDoc(doc(db, 'students', uid, 'private', 'info'));
  const prevKluId = prevPrivSnap.exists()
    ? String((prevPrivSnap.data() as StudentPrivate).kluStudentId || '').trim().toUpperCase()
    : '';

  if (cleanId !== prevKluId) {
    const existingRegistry = await lookupStudentIdRegistry(cleanId);
    if (existingRegistry && existingRegistry.ownerUid !== uid) {
      throw new Error(
        `Student ID "${cleanId}" is already linked to another KLU TRIBE profile.`
      );
    }
  }

  try {
    await updateDoc(doc(db, 'students', uid, 'private', 'info'), {
      phone: clampStr(updates.phone, 16),
      kluStudentId: cleanId,
      gender: updates.gender,
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'students', uid), {
      maskedStudentId: maskStudentId(cleanId),
      updatedAt: serverTimestamp(),
    });

    // Migrate studentIdRegistry entry if ID changed
    try {
      const pubSnap = await getDoc(doc(db, 'students', uid));
      if (pubSnap.exists()) {
        const pub = pubSnap.data() as StudentPublic;
        if (prevKluId && prevKluId !== cleanId && /^[A-Z0-9]{6,20}$/.test(prevKluId)) {
          const oldRegRef = doc(db, 'studentIdRegistry', prevKluId);
          const oldRegSnap = await getDoc(oldRegRef);
          if (oldRegSnap.exists() && (oldRegSnap.data() as StudentIdRegistryRecord).ownerUid === uid) {
            await deleteDoc(oldRegRef);
          }
        }
        await ensureStudentIdRegistryForProfile(pub, cleanId, authMethod);
      }
    } catch {
      // Non-blocking registry migration
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribePublicStudents(
  onData: (students: StudentPublic[]) => void,
  includeAllForAdmin = false
): Unsubscribe {
  const path = 'students';
  const q = includeAllForAdmin
    ? query(collection(db, path))
    : query(collection(db, path), where('isSuspended', '==', false));

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => d.data() as StudentPublic);
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeStudentPrivateInfos(
  uids: string[],
  onData: (privateMap: Record<string, StudentPrivate>) => void
): Unsubscribe {
  const uniqueUids = Array.from(new Set(uids.filter(Boolean)));
  if (uniqueUids.length === 0) {
    onData({});
    return () => {};
  }

  let latest: Record<string, StudentPrivate> = {};
  const unsubs = uniqueUids.map((uid) => {
    const path = `students/${uid}/private/info`;
    return onSnapshot(
      doc(db, 'students', uid, 'private', 'info'),
      (snap) => {
        if (snap.exists()) {
          latest = { ...latest, [uid]: snap.data() as StudentPrivate };
        } else {
          const copy = { ...latest };
          delete copy[uid];
          latest = copy;
        }
        onData({ ...latest });
      },
      (error) => handleFirestoreError(error, OperationType.GET, path)
    );
  });

  return () => {
    unsubs.forEach((unsub) => unsub());
  };
}

export function subscribeMyConnections(
  uid: string,
  onData: (connections: Connection[]) => void
): Unsubscribe {
  const path = 'connections';
  const q = query(collection(db, path), where('participantUids', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Connection, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function sendConnectionRequest(
  from: StudentPublic,
  to: StudentPublic,
  note: string
): Promise<void> {
  const id = [from.uid, to.uid].sort().join('_');
  const path = `connections/${id}`;
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'connections', id), {
      fromUid: from.uid,
      toUid: to.uid,
      fromName: clampStr(from.fullName, 80),
      toName: clampStr(to.fullName, 80),
      participantUids: [from.uid, to.uid],
      status: 'pending',
      note: clampStr(note, 240),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function respondConnectionRequest(
  connectionId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const path = `connections/${connectionId}`;
  try {
    await updateDoc(doc(db, 'connections', connectionId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeConnectionMessages(
  connectionId: string,
  onData: (messages: DirectMessage[]) => void
): Unsubscribe {
  const path = `connections/${connectionId}/messages`;
  const q = query(collection(db, 'connections', connectionId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DirectMessage, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function sendDirectMessage(
  connectionId: string,
  senderUid: string,
  senderName: string,
  body: string
): Promise<void> {
  const path = `connections/${connectionId}/messages`;
  try {
    await addDoc(collection(db, 'connections', connectionId, 'messages'), {
      senderUid,
      senderName: clampStr(senderName, 80),
      body: clampStr(body, 1000),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribePublicIdeas(onData: (ideas: StartupIdea[]) => void): Unsubscribe {
  const path = 'ideas';
  const q = query(collection(db, path), where('visibility', '==', 'public'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StartupIdea, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeAllIdeasForAdmin(onData: (ideas: StartupIdea[]) => void): Unsubscribe {
  const path = 'ideas';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StartupIdea, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeMyIdeas(uid: string, onData: (ideas: StartupIdea[]) => void): Unsubscribe {
  const path = 'ideas';
  const q = query(collection(db, path), where('authorUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StartupIdea, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createStartupIdea(payload: {
  authorUid: string;
  authorName: string;
  authorBranch: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  stage: StartupIdea['stage'];
  requiredSkills: string[];
  rolesNeeded: string;
  visibility: 'public' | 'private';
}): Promise<void> {
  const path = 'ideas';
  try {
    await addDoc(collection(db, path), {
      authorUid: payload.authorUid,
      authorName: clampStr(payload.authorName, 80),
      authorBranch: clampStr(payload.authorBranch, 20),
      title: clampStr(payload.title, 100),
      description: clampStr(payload.description, 800),
      problem: clampStr(payload.problem, 400),
      solution: clampStr(payload.solution, 400),
      stage: payload.stage,
      requiredSkills: payload.requiredSkills.slice(0, 10),
      rolesNeeded: clampStr(payload.rolesNeeded, 160),
      visibility: payload.visibility,
      interestedUids: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleIdeaInterest(idea: StartupIdea, uid: string): Promise<void> {
  const path = `ideas/${idea.id}`;
  try {
    const exists = idea.interestedUids.includes(uid);
    const next = exists
      ? idea.interestedUids.filter((id) => id !== uid)
      : [...idea.interestedUids, uid];
    await updateDoc(doc(db, 'ideas', idea.id), {
      interestedUids: next,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteIdea(ideaId: string): Promise<void> {
  const path = `ideas/${ideaId}`;
  try {
    await deleteDoc(doc(db, 'ideas', ideaId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeSkillExchanges(onData: (items: SkillExchange[]) => void): Unsubscribe {
  const path = 'skillExchanges';
  const q = query(collection(db, path), where('status', 'in', ['open', 'matched']));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SkillExchange, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createSkillExchange(payload: {
  authorUid: string;
  authorName: string;
  authorBranch: string;
  teachSkill: string;
  learnSkill: string;
  note: string;
}): Promise<void> {
  const path = 'skillExchanges';
  try {
    await addDoc(collection(db, path), {
      authorUid: payload.authorUid,
      authorName: clampStr(payload.authorName, 80),
      authorBranch: clampStr(payload.authorBranch, 20),
      teachSkill: clampStr(payload.teachSkill, 60),
      learnSkill: clampStr(payload.learnSkill, 60),
      note: clampStr(payload.note, 300),
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSkillExchangeStatus(
  exchangeId: string,
  status: SkillExchange['status']
): Promise<void> {
  const path = `skillExchanges/${exchangeId}`;
  try {
    await updateDoc(doc(db, 'skillExchanges', exchangeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeProjects(onData: (projects: ProjectTeam[]) => void): Unsubscribe {
  const path = 'projects';
  const q = query(collection(db, path), where('status', 'in', ['recruiting', 'active', 'completed']));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProjectTeam, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createProjectTeam(payload: {
  authorUid: string;
  authorName: string;
  title: string;
  description: string;
  techStack: string[];
  openRoles: string;
  githubUrl: string;
  portfolioUrl: string;
  isHackathonTeam: boolean;
}): Promise<void> {
  const path = 'projects';
  try {
    await addDoc(collection(db, path), {
      authorUid: payload.authorUid,
      authorName: clampStr(payload.authorName, 80),
      title: clampStr(payload.title, 100),
      description: clampStr(payload.description, 600),
      techStack: payload.techStack.slice(0, 12),
      openRoles: clampStr(payload.openRoles, 160),
      githubUrl: clampStr(payload.githubUrl, 240),
      portfolioUrl: clampStr(payload.portfolioUrl, 240),
      isHackathonTeam: Boolean(payload.isHackathonTeam),
      memberUids: [payload.authorUid],
      status: 'recruiting',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleProjectJoin(project: ProjectTeam, uid: string): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    const isMember = project.memberUids.includes(uid);
    const next = isMember
      ? project.memberUids.filter((id) => id !== uid)
      : [...project.memberUids, uid];
    await updateDoc(doc(db, 'projects', project.id), {
      memberUids: next,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeOpportunities(
  onData: (items: Opportunity[]) => void,
  isAdminMode = false
): Unsubscribe {
  const path = 'opportunities';
  const q = isAdminMode
    ? query(collection(db, path))
    : query(collection(db, path), where('approvalStatus', '==', 'approved'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Opportunity, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeMySubmittedOpportunities(
  uid: string,
  onData: (items: Opportunity[]) => void
): Unsubscribe {
  const path = 'opportunities';
  const q = query(collection(db, path), where('submittedByUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Opportunity, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function submitOpportunity(payload: {
  submittedByUid: string;
  submittedByName: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  source: string;
  eligibility: string;
  deadline: string;
  applyUrl: string;
  autoApprove?: boolean;
}): Promise<void> {
  const path = 'opportunities';
  try {
    await addDoc(collection(db, path), {
      submittedByUid: payload.submittedByUid,
      submittedByName: clampStr(payload.submittedByName, 80),
      title: clampStr(payload.title, 120),
      organization: clampStr(payload.organization, 100),
      category: payload.category,
      source: clampStr(payload.source, 100),
      eligibility: clampStr(payload.eligibility, 160),
      deadline: clampStr(payload.deadline, 60),
      applyUrl: clampStr(payload.applyUrl, 300),
      approvalStatus: payload.autoApprove ? 'approved' : 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeCampusEvents(onData: (events: CampusEvent[]) => void): Unsubscribe {
  const path = 'campusEvents';
  const q = query(
    collection(db, path),
    where('section', 'in', ['Samyak', 'Surabhi', 'Clubs', 'Sports', 'Events', 'Achievements', 'Weekend'])
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CampusEvent, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createCampusEvent(payload: {
  createdByUid: string;
  title: string;
  section: CampusSection;
  dateLabel: string;
  venue: string;
  description: string;
}): Promise<void> {
  const path = 'campusEvents';
  try {
    await addDoc(collection(db, path), {
      createdByUid: payload.createdByUid,
      title: clampStr(payload.title, 120),
      section: payload.section,
      dateLabel: clampStr(payload.dateLabel, 60),
      venue: clampStr(payload.venue, 100),
      description: clampStr(payload.description, 600),
      attendeeUids: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleEventAttendance(event: CampusEvent, uid: string): Promise<void> {
  const path = `campusEvents/${event.id}`;
  try {
    const joined = event.attendeeUids.includes(uid);
    const next = joined
      ? event.attendeeUids.filter((id) => id !== uid)
      : [...event.attendeeUids, uid];
    await updateDoc(doc(db, 'campusEvents', event.id), {
      attendeeUids: next,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createContentReport(payload: {
  reporterUid: string;
  targetType: ContentReport['targetType'];
  targetId: string;
  reason: string;
}): Promise<void> {
  const path = 'reports';
  try {
    await addDoc(collection(db, path), {
      reporterUid: payload.reporterUid,
      targetType: payload.targetType,
      targetId: payload.targetId,
      reason: clampStr(payload.reason, 400),
      status: 'open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeAdminReports(onData: (reports: ContentReport[]) => void): Unsubscribe {
  const path = 'reports';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContentReport, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeAuditLogs(onData: (logs: AuditLog[]) => void): Unsubscribe {
  const path = 'auditLogs';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditLog, 'id'>) }));
      onData(rows);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function writeAuditLog(
  adminUid: string,
  adminEmail: string,
  action: string,
  targetId: string,
  details: string
): Promise<void> {
  const path = 'auditLogs';
  try {
    await addDoc(collection(db, path), {
      adminUid,
      adminEmail: clampStr(adminEmail, 160),
      action: clampStr(action, 80),
      targetId: clampStr(targetId, 128),
      details: clampStr(details, 300),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function adminSetStudentVerification(
  adminUid: string,
  adminEmail: string,
  studentUid: string,
  verificationStatus: VerificationStatus
): Promise<void> {
  const path = `students/${studentUid}`;
  try {
    await updateDoc(doc(db, 'students', studentUid), {
      verificationStatus,
      updatedAt: serverTimestamp(),
    });
    await writeAuditLog(
      adminUid,
      adminEmail,
      `VERIFICATION_${verificationStatus.toUpperCase()}`,
      studentUid,
      `Set verification status to ${verificationStatus}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminSetStudentSuspension(
  adminUid: string,
  adminEmail: string,
  studentUid: string,
  isSuspended: boolean
): Promise<void> {
  const path = `students/${studentUid}`;
  try {
    await updateDoc(doc(db, 'students', studentUid), {
      isSuspended,
      updatedAt: serverTimestamp(),
    });
    await writeAuditLog(
      adminUid,
      adminEmail,
      isSuspended ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_RESTORED',
      studentUid,
      isSuspended ? 'Suspended student account' : 'Restored student account'
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminModerateOpportunity(
  adminUid: string,
  adminEmail: string,
  opportunityId: string,
  approvalStatus: 'approved' | 'rejected'
): Promise<void> {
  const path = `opportunities/${opportunityId}`;
  try {
    await updateDoc(doc(db, 'opportunities', opportunityId), {
      approvalStatus,
      updatedAt: serverTimestamp(),
    });
    await writeAuditLog(
      adminUid,
      adminEmail,
      `OPPORTUNITY_${approvalStatus.toUpperCase()}`,
      opportunityId,
      `Moderated opportunity listing to ${approvalStatus}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function adminResolveReport(
  adminUid: string,
  adminEmail: string,
  reportId: string,
  status: 'resolved' | 'dismissed'
): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      status,
      updatedAt: serverTimestamp(),
    });
    await writeAuditLog(
      adminUid,
      adminEmail,
      `REPORT_${status.toUpperCase()}`,
      reportId,
      `Marked report as ${status}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function exportStudentsToCsv(
  students: StudentPublic[],
  privateMap: Record<string, StudentPrivate> = {}
): void {
  const headers = [
    'MemberNumber',
    'UID',
    'FullName',
    'FullKLUStudentID',
    'MaskedKLUId',
    'Email',
    'Phone',
    'Gender',
    'Branch',
    'Year',
    'Batch',
    'CampusMode',
    'PrimaryCategory',
    'SecondaryInterests',
    'Skills',
    'Bio',
    'CareerGoal',
    'StartupInterest',
    'StartupIdeaSummary',
    'RoadmapCompleted',
    'AllowConnections',
    'VerificationStatus',
    'Suspended',
    'RegisteredAt',
  ];
  const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const rows = students.map((s) => {
    const priv = privateMap[s.uid];
    const roadmapDone = (s.roadmap || []).filter((r) => r.completed).length;
    const registered = s.createdAt?.toDate ? s.createdAt.toDate().toISOString() : '';
    return [
      s.memberNumber,
      s.uid,
      s.fullName,
      priv?.kluStudentId || '',
      s.maskedStudentId,
      priv?.email || '',
      priv?.phone || '',
      priv?.gender || '',
      s.branch,
      s.year,
      s.batch,
      s.campusMode || 'Unlisted',
      s.primaryCategory,
      (s.secondaryInterests || []).join('; '),
      (s.skills || []).join('; '),
      s.bio || '',
      s.careerGoal || '',
      s.startupInterest ? 'Yes' : 'No',
      s.startupIdeaSummary || '',
      `${roadmapDone}/${(s.roadmap || []).length}`,
      s.allowConnections ? 'Yes' : 'No',
      s.verificationStatus,
      s.isSuspended ? 'Yes' : 'No',
      registered,
    ]
      .map(escapeCell)
      .join(',');
  });
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `klu-tribe-students-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
