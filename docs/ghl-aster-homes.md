# AcquisitionOS / iAcquire — HighLevel setup

This is the internal implementation and account guide for the Aster Homes lead funnel. V1 uses the website's server-side lead service, HighLevel's contact/opportunity APIs, an optional server-side AI endpoint, and HighLevel workflows. There is no required third-party automation service.

## Account inventory

The authorized sub-account is `iAcquire` (`u69CVh0ZlAofUmRoj1zF`). The named **iAcquire Web Integration** already exists as an active HighLevel Private Integration, is used by the website, and was last used during the verified synthetic submission. Its token is server-only in the ignored `.env.local`; never print, commit, paste into chat, or include it in a snapshot. The integration uses contact write and opportunity read/write permissions.

Configured assets include:

- `Aster Homes — Buyer Acquisition` pipeline: New Lead, Qualifying, Qualified, Appointment Booked, Showed, Proposal / Offer, Won, Lost.
- Website-mapped contact fields for buyer preferences, attribution, lead/opportunity IDs, and canonical iAcquire score, temperature, status, reason, summary, next action, follow-up strategy, analysis timestamp, and automation status.
- Aster Homes source/buyer/qualification/appointment/customer/lost tags, including `consent:marketing-email` (created Sep 28, 2026 with an explicit opt-in description).
- `Aster Homes — Property Consultation` calendar and nine email templates.
- Twelve workflows in `iAcquire — Aster Homes Demo`.

The website creates or updates a HighLevel contact and a matching opportunity in `01 — New Lead`. It writes the HighLevel contact and opportunity IDs into the iAcquire integration fields. Repeated submissions update the matching opportunity without reopening a closed deal or moving it backward.

## Synthetic test evidence

On Sep 28, 2026, the live localhost form accepted **AOS Synthetic QA** with inquiry-contact consent checked and marketing opt-in left false. HighLevel created the contact with the source and buyer-intent tags, mapped the submitted preferences and synthetic QA note, and created an open opportunity in `01 — New Lead`. The contact has no `consent:marketing-email` tag. The named iAcquire Web Integration's last-used time matches the CRM sync.

After IAQ—02 was published, HighLevel's Tasks list showed its linked `New Aster Homes inquiry — review and follow up` task assigned to Mark Lester Acak, due the next day, with the submitted qualification context and recommended next action resolved into the description. The task is evidence that the internal handoff action ran. IAQ—02's Enrollment history and Execution logs pages currently show no entries, so those built-in records do not independently confirm the enrollment event.

AI output on AOS Synthetic QA remains blank and its qualification status is pending because `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` are not present in `.env.local`. Its score, temperature, and AI writeback are therefore not live-verified. A separate synthetic HighLevel appointment for Alex Morgan is Confirmed for Sep 30, 2026, 9:00–9:30 AM Asia/Singapore. IAQ—07 was Draft/off when it was created, so that appointment proves the calendar record exists but not that booking automation ran. IAQ—09 moved a synthetic open Aster Homes opportunity to `05 — Showed`. On Sep 28, the synthetic AOS opportunity was marked Lost with opportunity reason `Synthetic QA cleanup`; its contact lost-reason field is `Other — manual review`. IAQ—11's execution log confirms enrollment, `lead:lost` application, and completion of the sales-follow-up removal actions. The synthetic contact has no marketing-consent tag. The appointment and website lead are separate records; this is not a single-contact end-to-end journey. No customer email was sent.

## Data and consent

The lead API requires `consent_to_contact=true` for a requested inquiry response. `marketing_opt_in` is separate, optional, and false unless the visitor explicitly checks the marketing checkbox. Each website submission removes the old `consent:marketing-email` tag, then adds it only for explicit opt-in. Marketing workflows must check that tag, native unsubscribe/DND state, Won/customer status, and appointment status immediately before every marketing message. IAQ—04/05/06 have these checks before each marketing send. IAQ—12 requires explicit marketing consent and excludes `appointment:booked` contacts in each of its three eligible 90-day reactivation branches, while retaining its DND, Won, Disqualified, opt-out, lost-reason, and response-stop protections. IAQ—07 applies `appointment:booked` before its opportunity lookup and removes the contact from IAQ—04/05/06/12 before either opportunity branch. This is the intended nurture stop, but the live booking/tag/removal sequence is not yet verified because IAQ—07 is Draft/off. The booking page has no required marketing checkbox; appointment confirmations and reminders are service messages.

AI qualification is server-side. The request contains stated intent, property type, timeline, location preference, bedrooms, budget range, financing response, notes, and consent state; it omits the lead's name, email, and phone. The score is for sales-response priority only. It must not be used for housing/lending eligibility and must not use name, location, protected characteristics, budget, financing status, or inferred wealth as scoring factors. Temperature is derived from score: HOT 70–100, WARM 42–69, COLD 0–41. HighLevel workflows branch on canonical temperature/status fields.

## Pipeline behavior

| Stage | Use |
| --- | --- |
| `01 — New Lead` | Website-created inquiry |
| `02 — Qualifying` | Warm/cold lead requiring nurture or review |
| `03 — Qualified` | Hot or sales-ready lead |
| `04 — Appointment Booked` | Consultation is on the calendar |
| `05 — Showed` | Consultation completed |
| `06 — Proposal / Offer` | Sales follow-up / offer activity |
| `07 — Won` | Opportunity converted; onboarding begins |
| `08 — Lost` | Opportunity closed lost; respectful reactivation path |

Website/server code creates the opportunity in New Lead and writes qualification fields. HighLevel owns qualification tags and all later stage movement so the server does not race the workflow router.

## Workflow audit register

All 12 records exist. IAQ—01/02/03/09/11 are **Published** because their internal tag, task, routing, stage, or stop actions are safe without email delivery. IAQ—04/05/06/07/08/10/12 remain **Draft/off** because each contains one or more customer-facing email actions and the approved sender/test mailbox are missing. IAQ—07's trigger/branch configuration is saved, but its complete booking-to-reminder execution has not been verified. Synthetic tests verified IAQ—01's tag action, IAQ—02's internal task, IAQ—03's pending route, IAQ—09's stage action, and IAQ—11's actual Lost trigger, `lead:lost` tag, and follow-up stop. No customer-facing message was sent. Do not treat “configured” as “verified.”

| Workflow | Purpose and observed configuration | Enabled | Verification and remaining gap |
| --- | --- | --- | --- |
| IAQ—01 New Lead Intake | Contact tag `source:aster-homes` added; applies `automation:active`. The duplicate opportunity-create and qualification-reset actions were removed because the website/API owns those writes. Re-entry is off. | Yes — Published | HighLevel Test workflow log shows `Add automation:active tag` executed on the synthetic Alex Morgan contact. Natural trigger enrollment is not separately verified. |
| IAQ—02 New Inquiry Sales Handoff | When the iAcquire Lead ID changes, creates an internal review task assigned to Mark Lester Acak with a one-day due date. Retired invalid webhook removed. Re-entry on; multiple opportunities off. | Yes — Published | Website submission was followed by the linked task in HighLevel Tasks, with field tokens resolved and Mark assigned. Enrollment history and execution logs remain empty, so preserve that discrepancy in the evidence. |
| IAQ—03 Qualification Router | Trigger: `iAcquire Qualification Status` changes. HOT, WARM, and COLD each require the matching temperature **and** `iAcquire Qualification Status = Qualified`. HOT clears stale WARM/COLD tags, applies `lead:hot` and `lead:qualified`, removes the contact from IAQ—05/06, sends Mark an internal notification, finds the most recent open opportunity in the Buyer Acquisition pipeline, and moves a match to `03 — Qualified` with backward moves disabled. WARM/COLD clear stale classification tags, apply the matching lead tag, and remove the contact from the other nurture workflows; pending clears classification tags and ends. | Yes — Published | The pending route ran on a synthetic contact. HOT/WARM/COLD branch execution has not been proven with live AI output because provider credentials are missing. Safe internal routing is Published; no customer email is part of this workflow. |
| IAQ—04 Hot Lead Follow-Up | Trigger: `lead:hot`; three marketing emails with 1-day and 3-day waits. Re-entry off and stop-on-response on. | No — Draft/off | Immediately before every email, the saved gate requires explicit `consent:marketing-email`, Email DND off, no `customer:won`, and no `appointment:booked`. Sender/test recipient are missing; no delivery test. |
| IAQ—05 Warm Lead Nurture | Trigger: `lead:warm`; three marketing emails with 2-day and 5-day waits. Re-entry off, multiple opportunities off, and stop-on-response on. | No — Draft/off | The same eligibility gate appears before every send, including after each wait. Sender/test recipient are missing; no delivery or stop-condition test. |
| IAQ—06 Cold Lead Nurture | Trigger: `lead:cold`; waits 14 days before a marketing reactivation email. | No — Draft/off | The same eligibility gate appears after the wait and immediately before the email. Sender/test recipient are missing; no delivery test. |
| IAQ—07 Appointment Booked | `Customer Booked Appointment` trigger, contact-only, filtered to `Aster Homes — Property Consultation`. This is scoped to customer bookings through that calendar and does not depend on the appointment being left in `new` status. Applies `appointment:booked`, removes contact from IAQ—04/05/06/12, then finds the newest open opportunity only in `Aster Homes — Buyer Acquisition`. Found → move it to `04 — Appointment Booked`; Not Found → create at stage 04 with duplicate creation disabled, then Go To the shared owner alert/confirmation/24-hour reminder/2-hour reminder sequence. | No — Draft/off | Trigger is saved and matches the calendar's enabled auto-confirm setting. The complete booking-to-reminder execution is not verified. HighLevel says cancellation pulls an active appointment run out before remaining steps; it treats rescheduling as a new appointment, but re-entry of this specific customer-booked trigger still needs a synthetic test. The shared branch sends customer emails with blank From Name/From Email and no test recipient; no safe test/publish yet. |
| IAQ—08 No-Show Recovery | Appointment Status trigger: Event type `Normal`, status `No-show`, calendar `Aster Homes — Property Consultation`; sends `Polite no-show reschedule email`, then applies `appointment:no-show`. | No — Draft/off | Exact trigger filters and linked `IAQ Email — No-Show` template are verified. Removed the fictional-demo sentence from that template and confirmed the workflow action now displays the cleaned copy. From Name/From Email and test recipient remain blank; no live no-show test. Keep off until sender approval/test recipient are available. |
| IAQ—09 Consultation Completed | Appointment Status trigger: Event type `Normal`, status `Showed`, calendar `Aster Homes — Property Consultation`; finds the newest open opportunity in the Buyer Acquisition pipeline and moves it to `05 — Showed` with backward movement disabled. | Yes — Published | Synthetic execution moved an open Aster Homes opportunity to `05 — Showed`. Trigger filters were verified; a real appointment-status event was not live-tested. No messaging action. |
| IAQ—10 Won / Buyer Next Steps | Won opportunity in the Buyer Acquisition pipeline; applies `customer:won`, stops sales follow-up, then sends buyer next steps. | No — Draft/off | Internal tag/stop sequence is configured, but workflow includes a customer email with no approved sender/test recipient. Won transition and onboarding message remain untested. |
| IAQ—11 Lost Opportunity | Lost opportunity in the Buyer Acquisition pipeline; applies `lead:lost` and stops sales follow-up. IAQ—12 remains eligible for its 90-day review path. | Yes — Published | Verified from the synthetic Lost status event: reason `Synthetic QA cleanup`; execution log shows enrollment, `lead:lost` applied, and sales-follow-up removal completed. Contact lost-reason field is `Other — manual review`; no marketing consent is present. |
| IAQ—12 Lead Reactivation | Trigger: `lead:lost`; waits 90 days and branches by lost reason to timing, budget, financing, or manual review. Each of the three email branches requires `consent:marketing-email`, excludes `appointment:booked`, DND, Won/customer, Disqualified, opt-out, and nonmatching lost reasons. After the wait, the eligibility split checks that the contact remains in the relevant path. Settings: allow re-entry off, multiple opportunities off, stop-on-response on. | No — Draft/off | All three email gates and the timing path's operators were visually inspected. IAQ—07 is configured to remove contacts from IAQ—12 before its opportunity lookup, so a booking should stop future nurture. This interplay is not live-verified while IAQ—07 remains off. Sender/test recipient are missing. |

The CRM tag `consent:marketing-email` now exists. IAQ—04/05/06 each check consent, native Email DND, Won/customer, and appointment status immediately before every marketing message. IAQ—12 checks consent and excludes `appointment:booked` on all three reactivation email branches while retaining its other suppression rules. IAQ—07 applies that booking tag and removes contacts from IAQ—12 before later steps, but the contact-to-tag/workflow-stop behavior still needs a safe synthetic booking run. These four nurture workflows remain off pending sender approval and a controlled test recipient.

## Synthetic test plan

Use only an owner-controlled synthetic contact and the owner-approved test mailbox. Do not substitute a real prospect or reduce any production consent check.

| Field | Synthetic value / setup |
| --- | --- |
| Contact name | `AOS Synthetic QA Booking — YYYYMMDD-HHmm` |
| Email | `aster.qa+booking-YYYYMMDD-HHmm@<owner-approved-test-domain>`; confirm it reaches an inbox the owner controls before use. |
| Phone | An owner-controlled test number; do not use a lead's number. |
| Starting tags | `source:aster-homes`; do not pre-add `appointment:booked`, `lead:lost`, `lead:hot`, `lead:warm`, or `lead:cold` unless the test explicitly calls for that condition. |
| Inquiry consent | Submit the website form only with its required inquiry-contact consent checked. Keep `marketing_opt_in=false` unless the test operator explicitly opts this synthetic contact into marketing. |
| Test opportunity | For the Found path, use one open opportunity in `Aster Homes — Buyer Acquisition` and record its starting stage. For the Not Found path, use a separate synthetic contact with no open opportunity in that pipeline. |
| Test appointment | Book through the customer-facing `Aster Homes — Property Consultation` calendar link; its auto-confirm setting is enabled. Note the appointment ID, confirmed status, start time, and initial pipeline stage. |

Expected sequence for the contact with an inquiry and existing open opportunity: IAQ—01 applies `automation:active`; IAQ—02 creates the internal review task; IAQ—03 routes the current qualification status (Pending with missing AI credentials); booking the appointment through the customer calendar should enroll IAQ—07, apply `appointment:booked`, remove the contact from IAQ—04/05/06/12, and move the newest open Aster Homes opportunity to `04 — Appointment Booked`; then the owner alert and service confirmation run, with 24-hour and 2-hour service reminders only if the appointment is still active. For the separate no-open-opportunity contact, IAQ—07 should create a single opportunity in stage 04; duplicate creation is disabled. Later marking the synthetic appointment `Showed` should let IAQ—09 move its open opportunity to `05 — Showed`.

The Lost-path synthetic check was completed separately on `AOS Synthetic QA`: set the contact's `Aster Homes Lost Reason` to `Other — manual review`, then mark only its Aster Homes opportunity Lost with opportunity reason `Synthetic QA cleanup`. Expected and observed in IAQ—11 execution logs: enroll the contact, apply `lead:lost`, and complete the sales-follow-up removal action. The contact has no `consent:marketing-email` tag; IAQ—12 remains Draft/off, so no reactivation message was sent.

For suppression checks, use a separate synthetic contact and explicitly grant marketing consent only for that test. Confirm each marketing branch skips when the contact has `appointment:booked`, Email DND, `customer:won`, Disqualified, opt-out, or a nonmatching lost reason; confirm that no consent tag also skips every marketing send. Keep IAQ—04/05/06/12 off until approved sender identity and test recipient exist; inspect workflow execution logs and CRM tags/stages after each event. Then test cancellation and reschedule on the same synthetic appointment: cancellation should stop remaining reminder steps; a rescheduled appointment should receive reminders aligned to the new time, with duplicate opportunity prevention intact. HighLevel's support pages describe rescheduling differently, so record the observed trigger/re-entry behavior before enabling IAQ—07.

## Snapshot

The reusable `iAcquire Core — v1` snapshot remains HighLevel version v3. The refresh picker exposes reusable fields, tags, pipeline, calendar, and email templates; searching for workflow assets returned none. No contacts or appointments were selected. No snapshot refresh was made. Revisit only if workflow assets become selectable; exclude contacts, appointments, credentials, and synthetic customer data.

## Environment

Required production values live in the ignored `.env.local`. Names and exposure are documented in the root `.env.example`. The live qualification configuration is `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`; all three are server-only. The HighLevel API token, location, pipeline/stage IDs, and contact-field IDs are also server-only. No automation-webhook or callback variables are part of V1.

The account currently uses HighLevel's shared `send.lcmsgsndr.com` sender domain; a dedicated Aster Homes sender domain is not connected. Do not claim dedicated sender authorization. Owner approval/verification and an approved synthetic test recipient are required before testing email delivery. As of Sep 28, 2026, `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` are absent from `.env.local`; their secret values must remain there and must never be printed or pasted into chat. No real contacts should be enrolled to test.

## Internal portfolio offer

AcquisitionOS (AOS): **$999 one-time setup + $199/month**. Third-party software and usage fees are excluded. The client owns and pays for client-specific third-party accounts directly. Keep this offer off the Aster Homes public site.

## Reuse for client accounts

Treat Aster Homes as configuration rather than hard-coded business identity. A client setup must configure company name and brand, industry/services, qualification rubric and score thresholds, pipeline and stages, calendar, assigned sales team, approved sender, follow-up copy, onboarding content, retention content, and privacy/consent language. Secrets and customer records stay in the client's own account and environment.
