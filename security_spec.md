# Security Specification: INFAQ Landing Page Builder

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created by the authenticated user whose `request.auth.uid == userId`. Role cannot be set to 'admin' by a normal user during create or update unless the user matches the bootstrapped admin (`infaq.my@gmail.com`).
2. **Account Status Invariant**: Regular users cannot alter their own `accountStatus`, `role`, or timestamps. Only verified administrators can change `accountStatus` (e.g. from 'Pending' to 'Aktif' or 'Digantung').
3. **Order Payment Invariant**: A buyer can create their own order with status `Menunggu Pengesahan` and submit receipt details. A regular buyer CANNOT change `orderStatus` to `Diluluskan` or modify verification fields (`verifiedBy`, `verifiedAt`).
4. **Subscription Activation Invariant**: A subscription can only be activated, extended, or modified with new start/end dates by an administrator upon payment verification.
5. **Landing Page Ownership Invariant**: A user can only create or update a landing page where `userId == request.auth.uid`. A landing page status can only be set to `Diterbitkan` if the user's account is `Aktif` and has an active subscription.
6. **Public Read Integrity**: Public visitors can only read landing pages if `isPublished == true` and `status == 'Diterbitkan'`. Suspended or unapproved pages cannot be queried by unauthorized visitors.
7. **Product Ownership**: Products must have `userId == request.auth.uid` and can only be created, edited, or deleted by their verified owner or admin.
8. **Notification Isolation**: Notifications are private and can only be read/updated by the recipient (`userId == request.auth.uid`) or written by admin/system.
9. **Admin Audit Logs**: Read and write access is strictly limited to authenticated administrators. Regular buyers cannot read or tamper with audit logs.
10. **Slug Uniqueness**: A slug entry `/slugs/{slug}` can only be registered if it does not already exist, binding `slug` to `userId`.

## 2. The "Dirty Dozen" Payloads (Designed to Fail)
1. **Payload 1 (Privilege Escalation on User Creation)**:
   A new user registers and tries to submit `{"role": "admin", "accountStatus": "Aktif"}` with a non-admin email.
2. **Payload 2 (Self-Approval of Order)**:
   A buyer attempts to update their own order with `{"orderStatus": "Diluluskan", "verifiedBy": "hacker"}`.
3. **Payload 3 (Subscription Date Tampering)**:
   A buyer attempts to write a subscription with `{"endDate": "2099-12-31", "status": "Aktif"}` without admin verification.
4. **Payload 4 (Ghost Landing Page Hijack)**:
   User A attempts to update a landing page where `userId` belongs to User B.
5. **Payload 5 (Oversized Payload / Denial-of-Wallet)**:
   Attacker attempts to create a product with a 2MB description string exceeding `maxLength: 1000`.
6. **Payload 6 (Shadow Field Injection in User Document)**:
   Attacker attempts to update user profile with undocumented field `{"isSuperUser": true}`.
7. **Payload 7 (Unauthenticated Order Read)**:
   An unauthenticated guest tries to list or read documents in `/orders`.
8. **Payload 8 (Product Creation for Foreign User)**:
   User A creates a product pointing to `userId: "UserB"`.
9. **Payload 9 (Tampering with Audit Logs)**:
   Regular user attempts to write to `/adminAuditLogs/{logId}`.
10. **Payload 10 (Reading Another User's Notifications)**:
    User A attempts to query `/notifications` belonging to User B.
11. **Payload 11 (Slug Stealing)**:
    User A attempts to overwrite `/slugs/{slug}` that belongs to User B.
12. **Payload 12 (Publishing Landing Page while Suspended)**:
    A user whose account is `Digantung` attempts to set `status: "Diterbitkan"`.
