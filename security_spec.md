# KLU TRIBE — Security Specification & Threat Model

## 1. Data Invariants

1. **Zero-Trust PII Isolation**: Email addresses (`email`), mobile phone numbers (`phone`), full 10-digit KL University IDs (`kluStudentId`), and optional `gender` are strictly isolated in `/students/{studentId}/private/info`. They are never stored in `/students/{studentId}` and are readable only by `request.auth.uid == studentId` or a verified administrator.
2. **Institutional Verification Integrity**: New student profiles MUST initialize with `verificationStatus: "pending_review"` and `isSuspended: false`. Students cannot self-verify (`verificationStatus: "verified"`) or unsuspend themselves; only verified administrators can mutate `verificationStatus` or `isSuspended`.
3. **Immutable Ownership & Timestamps**: Document creator fields (`uid`, `authorUid`, `fromUid`, `submittedByUid`, `reporterUid`), `memberNumber`, and `createdAt` cannot be forged on creation or altered on update. All `createdAt` and `updatedAt` timestamps must equal `request.time`.
4. **Mutual Consent Messaging Gate**: Messages under `/connections/{connectionId}/messages/{messageId}` are gated via `get()` on the parent `/connections/{connectionId}` document, requiring `request.auth.uid in parent.participantUids` AND `parent.status == 'accepted'`.
5. **Moderated Opportunities Queue**: Student-submitted internships and jobs MUST initialize with `approvalStatus: "pending"`. Only verified admins can transition `approvalStatus` to `"approved"` or `"rejected"`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Self-Verification Spoof**: Student creates `/students/{uid}` with `verificationStatus: "verified"`. Expected: `PERMISSION_DENIED`.
2. **PII Snooping**: Authenticated student A calls `getDoc` on `/students/{uidB}/private/info`. Expected: `PERMISSION_DENIED`.
3. **Unverified Admin Email Spoof**: User with unverified email token matching admin email attempts to approve a student ID. Expected: `PERMISSION_DENIED` (`email_verified == true` enforced).
4. **Shadow Field Injection**: Student updates `/students/{uid}` with extra field `{ isAdmin: true }`. Expected: `PERMISSION_DENIED` (`affectedKeys().hasOnly(...)` + `keys().hasOnly(...)`).
5. **Unconsented Direct Message**: Student A sends message in `/connections/{connId}/messages/{msgId}` while `conn.status == "pending"`. Expected: `PERMISSION_DENIED`.
6. **Unauthorized Connection Acceptance**: Sender (`fromUid`) tries to update `status` to `"accepted"` on their own outgoing connection request. Expected: `PERMISSION_DENIED` (only `toUid` can accept/decline).
7. **Fake Job Auto-Approval**: Student submits `/opportunities/{id}` with `approvalStatus: "approved"`. Expected: `PERMISSION_DENIED`.
8. **ID Poisoning / Buffer Exhaustion**: Client writes `/ideas/{200-char-invalid-id}` or 50KB `title`. Expected: `PERMISSION_DENIED` (`isValidId()` + `.size()` limits).
9. **Blanket Collection Scraping**: Unauthenticated or malicious client queries `collection(db, "students")` without `where("isSuspended", "==", false)` or tries reading `/reports`. Expected: `PERMISSION_DENIED`.
10. **Audit Log Tampering**: Client or admin attempts `update` or `delete` on `/auditLogs/{logId}`. Expected: `PERMISSION_DENIED`.
11. **Private Idea Exfiltration**: Student B attempts `getDoc` on `/ideas/{ideaId}` where `visibility == "private"`. Expected: `PERMISSION_DENIED`.
12. **Impersonated Author Creation**: Student A creates `/projects/{id}` with `authorUid: "{uidB}"`. Expected: `PERMISSION_DENIED`.
