# Privacy Policy

**Effective date: July 28, 2026 (version 3)**

This Privacy Policy explains what information Habi Sloth ("the App") collects,
how we use it, and what choices you have. The App is operated by
Studio Infinite Lives, LLC ("we", "us", "our"), and covers both the mobile app
and the web version. By using the App you agree to the practices described here.

## 1. Who we are

Studio Infinite Lives, LLC operates Habi Sloth. You can reach us about anything
in this policy at hello@infinitelives.io.

## 2. Information we collect

**Account information.** Your email address, a display name, and a Firebase user
ID. Sign-in is by email and password only; your password is handled and stored
by Google Firebase Authentication and is never visible to us. If you ask for a
password reset, Firebase sends the reset email to your address.

**Habit and activity data.** The habits you create (names, descriptions, notes,
goals, schedules), your daily activity counts, your completion history, and
related settings such as your time zone and your appearance and wallpaper
choices.

**Social data.** Your friends list, friend requests you send or receive (which
carry the sender's display name), the rosters and member statuses of shared
("coop") habits, and in-app notifications. Other users can create notifications
in your account — that is how friend requests and coop invitations reach you —
and those notifications carry the sender's display name and user ID.

**Credits.** The App awards credits automatically from your completion
percentages. We store a ledger of those credit and debit entries and your
current balance.

**Usage analytics.** We use Google Analytics for Firebase to understand how the
App is used in aggregate. We record events (for example, completing a habit or
sending a coop invitation), screen views, and a small set of user properties:
your number of active habits and friends as coarse buckets, whether you use
coop habits, whether you use the calendar, and whether you installed the web app
to your home screen. Analytics records use anonymous identifiers such as your
user ID and habit IDs. We do **not** send your display name, email address, or
habit names to analytics.

**Diagnostics and crash reports.** When the App crashes or hits an error we
collect diagnostic data so we can fix it: device model, operating system, app
version, stack traces, and recent log breadcrumbs. On mobile this goes to
Firebase Crashlytics. On the web, error reports are filed as issues in our
private bug tracker at GitHub. Before a web error report is filed, our backend
**redacts email addresses, authentication tokens, and user IDs** from it.

**Technical data.** Your IP address and connection details, which Google
Firebase necessarily sees when your device talks to it; your time zone; your
connectivity state; and locally cached copies of your own data (the Firestore
offline cache and app-local preferences) stored on your device.

## 3. How we use your information

- To provide and sync your habits and activity across your devices.
- To calculate your completion statistics, daily suggestions, and credits.
- To enable shared coop habits and friends with people you invite.
- To operate, maintain, and improve the App, including diagnosing crashes and
  errors.
- To protect the App against abuse and automated attacks (Firebase App Check /
  reCAPTCHA).
- To communicate with you about your account when necessary.

We do **not** sell your personal information, and we do **not** share it for
cross-context behavioural advertising.

## 4. What other users can see

- **Your display name is searchable** by other signed-in users, so they can send
  you a friend request or a coop invitation.
- **Coop members** of a habit you host or join see your display name, your
  progress count for that habit, and your chosen colour.
- **Friends** can see your habit completion progress on your profile page.
- Anything you type into a habit you share into a coop — its name and
  description — is visible to that coop's members.

The App does not show your email address to other users, your password is never
visible to anyone, and habits you have not shared into a coop stay private.

## 5. Who else processes your data

We use these service providers ("sub-processors"):

- **Google Firebase** — Authentication, Firestore, Cloud Functions, Hosting,
  Analytics, Crashlytics, and App Check / reCAPTCHA.
- **GitHub** — receives redacted web error reports only.

Your data is stored and processed in the **United States**. If you use the App
from outside the United States, you are transferring your information there.

## 6. Administrator access

A small number of named administrator accounts — an allowlist held in the App's
security rules — can read and write account data. That access exists for
support, data migrations, and investigating abuse. It is not used for anything
else.

## 7. Retention and deletion

We keep your habits, activity, and completion history for as long as your
account is open. Analytics data is retained for Google's default retention
window. Diagnostic reports are retained until the underlying bug is closed.

**Deleting your account.** You can request deletion from within the App, under
**Settings → Account Management → Delete Account**. Because deletion is
permanent, we schedule it 30 days ahead by default — but you can choose to have
it done at once:

- We ask you to re-enter your password and confirm, then schedule your account
  for deletion **30 days later**, and email you to confirm the request.
- **You can cancel at any time during those 30 days** by signing in again — the
  App will offer to cancel the scheduled deletion. Until the 30 days are up your
  account works normally and your data is still stored and processed as usual.
- **Prefer not to wait?** The same screen offers **Delete immediately**.
  Choosing it gives up the 30-day cancellation window: erasure begins the moment
  you confirm and normally completes within minutes. It cannot be undone, and we
  email you once it is finished. Everything below — what is deleted, and what
  can remain — applies in exactly the same way.
- When the 30 days are up (or straight away, if you chose immediate deletion) we
  delete your sign-in credentials and your data:
  your profile, habits, activity records, completion history, credit ledger,
  notifications, friend list and friend requests, your entries in other users'
  friend lists, and your membership and counts in shared coop activity records.
  We email you when it is done.
- **What can remain.** Coop habits you took part in belong to their other
  members too: a coop you hosted is converted into personal habits for the
  remaining members, and historical shared counts contributed before your
  deletion may remain in their records. Deleted data may also persist briefly in
  encrypted backups before those are cycled out. Aggregate analytics and
  diagnostic records that are no longer linked to you are not deleted.
- We keep a minimal record that a deletion happened (your user ID and the dates,
  with no email address) for up to 90 days, so we can answer questions about it.

You can also ask us to delete your account by writing to
hello@infinitelives.io.

## 8. Security

We protect your data with Google Firebase Authentication, encryption in transit
(TLS), and Firestore security rules that scope each document to the account that
owns it. Callable backend endpoints are protected by Firebase App Check.
Administrator access is limited to an allowlist of specific accounts. No service
can promise perfect security, but we work to keep this one sound.

## 9. Your choices and rights

- **Access and edit.** You can view and edit your profile and habits within the
  App at any time.
- **Deletion.** See section 7.
- **Analytics on the web.** Analytics is off until you allow it, and you can
  change or withdraw that choice at any time under **Settings → Cookie
  Preferences**.
- **Analytics on mobile.** Analytics collection is currently on by default in the
  mobile app, and there is no in-app toggle yet. Until we add one, you can stop
  it by writing to us at hello@infinitelives.io or by uninstalling the App.
- **If you are in the EEA or the UK**, you have the right to access, correct,
  erase, and port your data, to object to or restrict processing, and to
  complain to your data protection authority. We process your data to perform
  our agreement with you and on the basis of our legitimate interest in keeping
  the App working and secure; analytics on the web is processed with your
  consent.
- **If you are in California**, you have the right to know what we collect, to
  delete it, to correct it, and not to be discriminated against for exercising
  those rights. We do not sell or share your personal information.

To exercise any of these rights, contact us at hello@infinitelives.io.

## 10. Children

Habi Sloth is **not intended for children under 13**, and not for anyone under
16 in the EEA or the UK unless local law allows a lower age. We do not knowingly
collect personal information from them. If we learn that an account belongs to
someone under those ages, we delete it.

## 11. Changes to this Policy

We may update this Privacy Policy from time to time. When we make material
changes we will increment the Privacy version and ask you to review and
re-accept it before you continue using the App.

## 12. Cookies and local storage (web)

When you use Habi Sloth in a web browser, we store some information on your
device. We group it by purpose so you can decide what to allow:

**Essential (always on).** These are strictly necessary to run the App and
cannot be turned off:

- Keeping you signed in (Firebase Authentication).
- Storing your habits and activity for offline-first use (Firestore cache and
  local snapshots).
- Protecting the App against abuse (App Check / reCAPTCHA security tokens).
- Remembering your cookie choice itself.

**Analytics (optional, off until you allow it).** Google Analytics for Firebase
sets cookies (`_ga`, `_ga_<id>`) to measure aggregate usage. These are **not**
set until you opt in. We do not use advertising or marketing cookies.

You choose your analytics preference the first time you open the web App, and
you can change or withdraw it at any time under **Settings → Cookie
Preferences**. Withdrawing consent turns analytics collection off and clears the
analytics cookies.

On mobile the App does not use browser cookies; it stores the same kind of
information in app-local storage instead, and mobile analytics is not
cookie-based.

## 13. Contact

Questions about your privacy? Contact us at hello@infinitelives.io.

© 2026 Studio Infinite Lives, LLC. All rights reserved.
