"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { chatOptions } from "@/lib/chat/options";
import { getPageAttribution } from "@/lib/leads/attribution";
import type { LeadFlowRequest } from "@/components/lead-flow-provider";
import type { BedroomPreference, BudgetRange, BuyerIntent, FinancingStatus, LeadSource, PropertyType, PurchaseTimeline } from "@/types/lead";
import { ChatActionButton } from "@/components/lead-action-button";

type Draft = {
  full_name: string;
  email: string;
  phone: string;
  intent: BuyerIntent | "";
  property_type: PropertyType | "";
  budget_range: BudgetRange | "";
  timeline: PurchaseTimeline | "";
  financing_status: FinancingStatus | "";
  bedrooms: BedroomPreference | "";
  preferred_location: string;
  notes: string;
  consent_to_contact: boolean;
  marketing_opt_in: boolean;
};

interface SubmissionResult {
  duplicate: boolean;
}

const stepNames = ["Home style", "Contact", "Intent", "Budget", "Timing", "Location"];
const emptyDraft: Draft = {
  full_name: "",
  email: "",
  phone: "",
  intent: "",
  property_type: "",
  budget_range: "",
  timeline: "",
  financing_status: "",
  bedrooms: "",
  preferred_location: "",
  notes: "",
  consent_to_contact: false,
  marketing_opt_in: false,
};

function OptionGrid<T extends string>({ label, options, value, onSelect }: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | "";
  onSelect: (value: T) => void;
}) {
  const selectedIndex = options.findIndex((option) => option.value === value);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const movement = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!movement) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[role='radio']"));
    const currentIndex = buttons.indexOf(event.target as HTMLButtonElement);
    if (currentIndex < 0 || buttons.length === 0) return;
    event.preventDefault();
    const nextIndex = (currentIndex + movement + buttons.length) % buttons.length;
    buttons[nextIndex].focus();
    buttons[nextIndex].click();
  };

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (value === "" && selectedIndex === -1 && options[0]?.value === option.value) ? 0 : -1}
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`min-h-[50px] rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${selected ? "border-aster-forest bg-aster-sage text-aster-forest" : "border-aster-border bg-aster-white text-[#566158] hover:border-[#BFCBBE]"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function LeadQualificationDialog({ open, request, bookingUrl, onClose }: {
  open: boolean;
  request: LeadFlowRequest;
  bookingUrl: string | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => ({ ...emptyDraft, property_type: request.propertyType ?? "" }));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const source: LeadSource = request.source ?? "landing_form";

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    headingRef.current?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  function nextStep() {
    setError("");
    if (step === 0 && !draft.property_type) return setError("Choose the kind of home you are looking for, or select ‘Open to options.’");
    if (step === 1) {
      if (draft.full_name.trim().length < 2) return setError("Please add your name so we know how to address you.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return setError("Please enter a valid email address.");
      if (draft.phone.replace(/\D/g, "").length < 7) return setError("Please enter a valid phone number.");
      if (!draft.consent_to_contact) return setError("Please confirm that Aster Homes may contact you about this inquiry.");
    }
    if (step === 2 && !draft.intent) return setError("Choose the kind of search that fits you best.");
    if (step === 3 && !draft.budget_range) return setError("Choose a budget range to continue.");
    if (step === 4 && (!draft.timeline || !draft.financing_status || !draft.bedrooms)) return setError("Choose an option for timing, financing, and bedrooms.");
    if (step === 5 && draft.preferred_location.trim().length < 2) return setError("Share a preferred location, or enter ‘Open to options.’");
    if (step < stepNames.length - 1) setStep((current) => current + 1);
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(0, current - 1));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== stepNames.length - 1 || submitting) return;
    setError("");
    if (draft.preferred_location.trim().length < 2) {
      setError("Share a preferred location, or enter ‘Open to options.’");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          source_detail: request.sourceDetail ?? null,
          full_name: draft.full_name,
          email: draft.email,
          phone: draft.phone,
          intent: draft.intent,
          property_type: draft.property_type,
          budget_range: draft.budget_range,
          timeline: draft.timeline,
          financing_status: draft.financing_status,
          bedrooms: draft.bedrooms,
          preferred_location: draft.preferred_location,
          notes: draft.notes,
          consent_to_contact: draft.consent_to_contact,
          marketing_opt_in: draft.marketing_opt_in,
          ...getPageAttribution(),
        }),
      });
      const data = await response.json() as { error?: string; duplicate?: boolean; statuses?: { crm: string; automation: string; qualification: string } };
      if (!response.ok || !data.statuses) throw new Error(data.error || "We couldn’t submit your request just now. Please try again.");
      setResult({ duplicate: Boolean(data.duplicate) });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We couldn’t submit your request just now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function stopBackdrop(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") event.preventDefault();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close inquiry form" onClick={onClose} onKeyDown={stopBackdrop} className="absolute inset-0 cursor-default bg-[#1c2821]/55 backdrop-blur-[2px]" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="lead-dialog-title" className="relative flex max-h-[94dvh] w-full max-w-[720px] flex-col overflow-hidden rounded-t-2xl border border-aster-border bg-aster-white shadow-[0_24px_80px_rgba(18,29,22,0.24)] sm:max-h-[min(880px,92dvh)] sm:rounded-2xl">
        <div className="flex items-start justify-between gap-5 border-b border-aster-border px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-aster-muted">Aster Homes · Home finder</p>
            <h2 id="lead-dialog-title" ref={headingRef} tabIndex={-1} className="font-display mt-1 text-3xl leading-tight text-aster-ink sm:text-4xl">{result ? "Your request is captured." : "Let’s find a useful starting point."}</h2>
          </div>
          <button type="button" aria-label="Close inquiry" onClick={onClose} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-aster-border text-[#566158] transition-colors hover:bg-aster-sage">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {result ? (
          <div className="modal-scroll overflow-y-auto p-5 sm:p-7">
            <div className="rounded-xl border border-[#D9E1D7] bg-aster-sage p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-aster-forest text-white"><Check size={19} aria-hidden="true" /></span>
              <h3 className="mt-4 text-base font-semibold text-aster-ink">{result.duplicate ? "We’ve updated your existing inquiry." : "Thanks — we have your request."}</h3>
              <p className="mt-2 text-sm leading-6 text-[#566158]">You asked Aster Homes to contact you about property assistance or a consultation. Your request has been saved.</p>
              <p className="mt-2 text-xs leading-5 text-aster-muted">Follow-up availability depends on the contact channels currently configured.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {bookingUrl && <a href={bookingUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white hover:bg-aster-forest-deep">Open booking calendar ↗</a>}
              {!bookingUrl && <ChatActionButton onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white hover:bg-aster-forest-deep">Talk with Aster Assistant</ChatActionButton>}
              <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-aster-border px-5 text-sm font-semibold text-aster-ink hover:bg-aster-sage">Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="px-5 pt-5 sm:px-7 sm:pt-6">
              <div className="flex items-center justify-between text-xs text-aster-muted"><span>Step {step + 1} of {stepNames.length} · {stepNames[step]}</span><span>{Math.round(((step + 1) / stepNames.length) * 100)}%</span></div>
              <div role="progressbar" aria-label="Inquiry progress" aria-valuemin={1} aria-valuemax={stepNames.length} aria-valuenow={step + 1} className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E9E7E0]"><div className="h-full rounded-full bg-aster-forest transition-[width] duration-300" style={{ width: `${((step + 1) / stepNames.length) * 100}%` }} /></div>
              <h3 className="font-display mt-5 text-3xl leading-tight text-aster-ink sm:text-4xl">
                {step === 0 && "What kind of home are you looking for?"}
                {step === 1 && "How can we reach you?"}
                {step === 2 && "What are you looking for?"}
                {step === 3 && "What budget feels comfortable?"}
                {step === 4 && "What’s your timing and financing?"}
                {step === 5 && "Where would you like to be?"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-aster-muted">
                {step === 0 && "Choose a home style to start. You can change your mind at any time."}
                {step === 1 && "We’ll only use these details to respond to this inquiry."}
                {step === 2 && "This helps us understand the kind of guidance you need."}
                {step === 3 && "Choose the closest fit. You can refine it during a conversation."}
                {step === 4 && "Choose the closest fit. You can always add context after."}
                {step === 5 && "Share a location or let us know you’re open to options."}
              </p>
            </div>

            <div className="modal-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {step === 0 && <OptionGrid label="Home style" options={chatOptions.propertyType} value={draft.property_type} onSelect={(value) => update("property_type", value)} />}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-semibold text-aster-ink sm:col-span-2" htmlFor="lead-full-name">Full name <span className="text-aster-clay">*</span>
                    <input id="lead-full-name" autoComplete="name" required value={draft.full_name} onChange={(event) => update("full_name", event.target.value)} placeholder="Your name" className="h-12 rounded-lg border border-aster-border bg-white px-3 text-sm font-normal text-aster-ink placeholder:text-[#A0A39B]" />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold text-aster-ink" htmlFor="lead-email">Email <span className="text-aster-clay">*</span>
                    <input id="lead-email" type="email" autoComplete="email" required value={draft.email} onChange={(event) => update("email", event.target.value)} placeholder="you@example.com" className="h-12 rounded-lg border border-aster-border bg-white px-3 text-sm font-normal text-aster-ink placeholder:text-[#A0A39B]" />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold text-aster-ink" htmlFor="lead-phone">Phone <span className="text-aster-clay">*</span>
                    <input id="lead-phone" type="tel" autoComplete="tel" inputMode="tel" required value={draft.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Your phone number" className="h-12 rounded-lg border border-aster-border bg-white px-3 text-sm font-normal text-aster-ink placeholder:text-[#A0A39B]" />
                  </label>
                  <label className="flex items-start gap-3 rounded-lg border border-aster-border bg-[#FBFAF6] p-3.5 text-xs leading-5 text-[#566158] sm:col-span-2">
                    <input type="checkbox" checked={draft.consent_to_contact} onChange={(event) => update("consent_to_contact", event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#355846]" />
                    <span>I’m asking Aster Homes to contact me about property assistance or a consultation. This does not sign me up for unrelated marketing. <a href="/privacy" className="font-semibold text-aster-forest underline underline-offset-2">Privacy details</a>.</span>
                  </label>
                  <label className="flex items-start gap-3 rounded-lg border border-aster-border bg-white p-3.5 text-xs leading-5 text-[#566158] sm:col-span-2">
                    <input type="checkbox" checked={draft.marketing_opt_in} onChange={(event) => update("marketing_opt_in", event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#355846]" />
                    <span>Optional: email me occasional home-search updates and helpful resources. I can unsubscribe at any time.</span>
                  </label>
                </div>
              )}

              {step === 2 && <OptionGrid label="Buyer intent" options={chatOptions.intent} value={draft.intent} onSelect={(value) => update("intent", value)} />}
              {step === 3 && <OptionGrid label="Budget range" options={chatOptions.budget} value={draft.budget_range} onSelect={(value) => update("budget_range", value)} />}
              {step === 4 && <div className="space-y-6"><div><p className="mb-2.5 text-xs font-semibold text-aster-ink">Purchase timeline</p><OptionGrid label="Purchase timeline" options={chatOptions.timeline} value={draft.timeline} onSelect={(value) => update("timeline", value)} /></div><div><p className="mb-2.5 text-xs font-semibold text-aster-ink">Financing status</p><OptionGrid label="Financing status" options={chatOptions.financing} value={draft.financing_status} onSelect={(value) => update("financing_status", value)} /></div><div><p className="mb-2.5 text-xs font-semibold text-aster-ink">Bedrooms</p><OptionGrid label="Bedrooms" options={chatOptions.bedrooms} value={draft.bedrooms} onSelect={(value) => update("bedrooms", value as BedroomPreference)} /></div></div>}
              {step === 5 && <div className="space-y-4"><label htmlFor="lead-location" className="grid gap-1.5 text-xs font-semibold text-aster-ink">Preferred location <span className="text-aster-clay">*</span><input id="lead-location" value={draft.preferred_location} onChange={(event) => update("preferred_location", event.target.value)} placeholder="A neighborhood, city, or ‘Open to options’" className="h-12 rounded-lg border border-aster-border bg-white px-3 text-sm font-normal text-aster-ink placeholder:text-[#A0A39B]" /></label><label htmlFor="lead-notes" className="grid gap-1.5 text-xs font-semibold text-aster-ink">Anything else we should know? <span className="font-normal text-aster-muted">Optional</span><textarea id="lead-notes" rows={4} maxLength={800} value={draft.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Share any details that would help us understand your search." className="resize-y rounded-lg border border-aster-border bg-white px-3 py-3 text-sm font-normal text-aster-ink placeholder:text-[#A0A39B]" /></label><p className="text-xs leading-5 text-aster-muted">We’ll use your information to respond to this inquiry and discuss current options.</p></div>}

              {error && <p role="alert" className="mt-5 rounded-lg border border-[#E7C5C1] bg-[#FCF3F1] px-3.5 py-3 text-sm text-[#8E3A32]">{error}</p>}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-aster-border bg-aster-white px-5 py-4 pb-[calc(1rem+var(--aster-safe-bottom))] sm:px-7 sm:pb-4">
              <button type="button" onClick={step === 0 ? onClose : previousStep} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#566158] hover:bg-aster-sage"><ArrowLeft size={16} aria-hidden="true" />{step === 0 ? "Cancel" : "Back"}</button>
              {step < stepNames.length - 1 ? (
                <button type="button" onClick={nextStep} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white hover:bg-aster-forest-deep">Continue <ArrowRight size={16} aria-hidden="true" /></button>
              ) : (
                <button type="submit" disabled={submitting} onClick={(event) => { if (draft.preferred_location.trim().length < 2) { event.preventDefault(); setError("Share a preferred location, or enter ‘Open to options.’"); } }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white hover:bg-aster-forest-deep disabled:cursor-wait disabled:opacity-60">{submitting ? "Sending request…" : "Send my request"}{!submitting && <ArrowRight size={16} aria-hidden="true" />}</button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
