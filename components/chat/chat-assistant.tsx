"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Bot, CalendarDays, LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { chatOptions } from "@/lib/chat/options";
import { chatStateSchema, type ChatEvent, type ChatState, type ChatSuggestion } from "@/lib/chat/demo-flow";
import { getPageAttribution } from "@/lib/leads/attribution";
import type { LeadInput } from "@/lib/leads/schema";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

interface ChatContactDraft {
  full_name: string;
  email: string;
  phone: string;
  consent_to_contact: boolean;
  marketing_opt_in: boolean;
}

type AssistantMode = "guided" | "configured" | "unavailable";

const initialState: ChatState = { step: "intent", answers: {} };
const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I can help you outline your home search. Are you looking for a place to live in, an investment, or something else?",
};
const emptyContact: ChatContactDraft = { full_name: "", email: "", phone: "", consent_to_contact: false, marketing_opt_in: false };

function restoreChatSession(): { state: ChatState; suggestions: ChatSuggestion[]; messages: ChatMessage[] } {
  const fresh = { state: initialState, suggestions: [...chatOptions.intent], messages: [initialMessage] };
  if (typeof window === "undefined") return fresh;
  try {
    const stored = sessionStorage.getItem("aster-chat-state-v1");
    if (!stored) return fresh;
    const parsed = chatStateSchema.safeParse(JSON.parse(stored));
    if (!parsed.success || parsed.data.step === "contact" || (parsed.data.step === "intent" && Object.keys(parsed.data.answers).length === 0)) return fresh;
    const suggestions = parsed.data.step === "intent" ? [...chatOptions.intent]
      : parsed.data.step === "budget" ? [...chatOptions.budget]
        : parsed.data.step === "property_type" ? [...chatOptions.propertyType]
          : parsed.data.step === "bedrooms" ? [...chatOptions.bedrooms]
            : parsed.data.step === "timeline" ? [...chatOptions.timeline]
              : parsed.data.step === "financing" ? [...chatOptions.financing] : [];
    return {
      state: parsed.data,
      suggestions,
      messages: [{ id: "resume", role: "assistant", content: "Welcome back. I’ve kept your search preferences for this browser session. You can continue or start again." }],
    };
  } catch {
    try { sessionStorage.removeItem("aster-chat-state-v1"); } catch { /* Storage is optional. */ }
    return fresh;
  }
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, content };
}

export function ChatAssistant({ open, bookingUrl, onOpen, onClose }: { open: boolean; bookingUrl: string | null; onOpen: () => void; onClose: () => void }) {
  const [restored] = useState(restoreChatSession);
  const [state, setState] = useState<ChatState>(restored.state);
  const [messages, setMessages] = useState<ChatMessage[]>(restored.messages);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>(restored.suggestions);
  const [assistantMode, setAssistantMode] = useState<AssistantMode>("guided");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState<ChatContactDraft>(emptyContact);
  const [contactBusy, setContactBusy] = useState(false);
  const [contactError, setContactError] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try {
      if (state.step === "intent" && Object.keys(state.answers).length === 0) sessionStorage.removeItem("aster-chat-state-v1");
      else sessionStorage.setItem("aster-chat-state-v1", JSON.stringify(state));
    } catch { /* Storage is optional. */ }
  }, [state]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const launcher = launcherRef.current;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const panel = document.getElementById("aster-chat-panel");
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"));
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (previousFocus && !previousFocus.closest("#aster-chat-panel")) previousFocus.focus();
      else launcher?.focus();
    };
  }, [open, onClose]);

  async function sendEvent(event: ChatEvent, visibleText?: string) {
    if (busy) return;
    const eventText = visibleText ?? (event.kind === "request_contact" ? "I’d like to talk with an advisor." : event.value);
    const nextMessages = event.kind === "request_contact" ? messages : [...messages, createMessage("user", eventText)];
    if (event.kind !== "request_contact") setMessages(nextMessages);
    setBusy(true);
    try {
      const history = nextMessages.slice(-8).map(({ role, content }) => ({ role, content }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, event, history }),
      });
      const data = await response.json() as { error?: string; state?: ChatState; assistant_message?: string; suggestions?: ChatSuggestion[]; assistant_mode?: AssistantMode };
      if (!response.ok || !data.state || !data.assistant_message) throw new Error(data.error || "The assistant couldn’t respond just now.");
      setState(data.state);
      setSuggestions(data.suggestions ?? []);
      setAssistantMode(data.assistant_mode ?? "guided");
      setMessages((current) => [...current, createMessage("assistant", data.assistant_message!)]);
      setContactError("");
    } catch {
      setMessages((current) => [...current, createMessage("assistant", "I’m having trouble connecting just now. You can try again, or use Find My Home to send a request." )]);
      setAssistantMode("unavailable");
    } finally {
      setBusy(false);
      setInput("");
    }
  }

  function sendText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value || busy) return;
    if (state.step === "location") void sendEvent({ kind: "answer", value }, value);
    else void sendEvent({ kind: "question", value }, value);
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactError("");
    if (contact.full_name.trim().length < 2) return setContactError("Please add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) return setContactError("Enter a valid email address.");
    if (contact.phone.replace(/\D/g, "").length < 7) return setContactError("Enter a valid phone number.");
    if (!contact.consent_to_contact) return setContactError("Confirm that Aster Homes may contact you about this request.");

    setContactBusy(true);
    try {
      const payload: Partial<LeadInput> & { source: "ai_chat"; consent_to_contact: true } = {
        source: "ai_chat",
        source_detail: "Aster Assistant conversation",
        full_name: contact.full_name,
        email: contact.email,
        phone: contact.phone,
        intent: state.answers.intent ?? "exploring",
        property_type: state.answers.property_type ?? "open",
        budget_range: state.answers.budget_range ?? "not_sure",
        timeline: state.answers.timeline ?? "exploring",
        financing_status: state.answers.financing_status ?? "not_sure",
        bedrooms: state.answers.bedrooms ?? "1",
        preferred_location: state.answers.preferred_location ?? "Open to options",
        notes: null,
        consent_to_contact: true,
        marketing_opt_in: contact.marketing_opt_in,
        ...getPageAttribution(),
      };
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string; duplicate?: boolean; statuses?: { crm: string; automation: string; qualification: string } };
      if (!response.ok || !data.statuses) throw new Error(data.error || "We couldn’t prepare your request just now.");
      setLeadSent(true);
      setState((current) => ({ ...current, step: "contact" }));
      setMessages((current) => [...current, createMessage("assistant", data.duplicate ? "Your existing Aster Homes request has been updated." : "Thanks — your request has been saved. We’ll use the details you shared to help with your search.")]);
      setSuggestions([]);
      try { sessionStorage.removeItem("aster-chat-state-v1"); } catch { /* Storage is optional. */ }
    } catch (error) {
      setContactError(error instanceof Error ? error.message : "We couldn’t prepare your request just now.");
    } finally {
      setContactBusy(false);
    }
  }

  function restartChat() {
    setState(initialState);
    setMessages([initialMessage]);
    setSuggestions([...chatOptions.intent]);
    setAssistantMode("guided");
    setContact(emptyContact);
    setContactError("");
    setLeadSent(false);
    try { sessionStorage.removeItem("aster-chat-state-v1"); } catch { /* Storage is optional. */ }
  }

  return (
    <>
      {!open && (
        <button ref={launcherRef} type="button" onClick={onOpen} aria-label="Open Aster Assistant" className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-[#D9DED6] bg-aster-white px-3.5 py-3 shadow-[0_8px_28px_rgba(39,51,43,0.14)] transition-transform hover:-translate-y-0.5 sm:bottom-7 sm:right-7 sm:px-4">
          <Image src="/brand/aster-symbol.svg" alt="" width={32} height={32} />
          <span className="text-left"><span className="block text-xs font-semibold text-aster-ink">Aster Assistant</span><span className="mt-0.5 block text-[10px] text-aster-muted">Home-search guide</span></span>
          <MessageCircle size={16} className="ml-1 text-aster-forest" aria-hidden="true" />
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#1c2821]/45 sm:items-end sm:justify-end sm:bg-transparent sm:p-7">
          <button type="button" aria-label="Close assistant" onClick={onClose} className="absolute inset-0 cursor-default sm:bg-transparent" />
          <section id="aster-chat-panel" role="dialog" aria-modal="true" aria-labelledby="aster-chat-title" className="chat-drawer relative z-10 flex w-full flex-col overflow-hidden border border-aster-border bg-aster-white shadow-[0_20px_70px_rgba(18,29,22,0.22)] sm:w-[420px] sm:rounded-2xl">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-aster-border px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aster-sage"><Image src="/brand/aster-logo-mark.png" alt="" width={32} height={32} /></div><div><h2 id="aster-chat-title" className="text-sm font-semibold text-aster-ink">Aster Assistant</h2><p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-aster-muted"><Sparkles size={12} aria-hidden="true" />{assistantMode === "configured" ? "AI home-search assistant" : "Home-search guide"} <span className="rounded bg-[#F0EAE0] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#75513D]">{assistantMode === "configured" ? "AI connected" : assistantMode === "unavailable" ? "Unavailable" : "Guided"}</span></p></div></div>
              <button type="button" aria-label="Close Aster Assistant" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#566158] hover:bg-aster-sage"><X size={18} aria-hidden="true" /></button>
            </header>

            <div ref={messagesRef} aria-live="polite" aria-relevant="additions text" className="chat-messages min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#FBFAF6] px-4 py-4 sm:px-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] ${message.role === "user" ? "rounded-2xl rounded-br-sm bg-aster-forest px-3.5 py-2.5 text-white" : "w-full rounded-2xl rounded-bl-sm border border-aster-border bg-aster-white px-3.5 py-3 text-aster-ink"}`}>
                    {message.role === "assistant" && <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-aster-muted"><Bot size={13} aria-hidden="true" />Aster Assistant</div>}
                    <p className="whitespace-pre-wrap text-[13px] leading-5">{message.content}</p>
                  </div>
                </div>
              ))}
              {state.step === "next_step" && !leadSent && (
                <div className="grid gap-2 rounded-xl border border-aster-border bg-aster-white p-3.5">
                  <button type="button" disabled={busy} onClick={() => void sendEvent({ kind: "request_contact" })} className="action-control inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-aster-forest px-3 text-sm font-semibold text-white hover:bg-aster-forest-deep disabled:opacity-50">Talk to an advisor <ArrowUpRight size={16} aria-hidden="true" /></button>
                  {bookingUrl ? <a href={bookingUrl} target="_blank" rel="noreferrer" className="action-control inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-aster-border bg-white px-3 text-sm font-semibold text-aster-ink hover:bg-aster-sage"><CalendarDays size={16} aria-hidden="true" />Book a consultation</a> : <button type="button" disabled={busy} onClick={() => void sendEvent({ kind: "request_contact" })} className="action-control inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-aster-border bg-white px-3 text-sm font-semibold text-aster-ink hover:bg-aster-sage disabled:opacity-50"><CalendarDays size={16} aria-hidden="true" />Request a consultation</button>}
                </div>
              )}
              {busy && <div className="flex items-center gap-2 text-xs text-aster-muted"><LoaderCircle size={14} className="animate-spin" aria-hidden="true" />Aster is thinking…</div>}
              {suggestions.length > 0 && state.step !== "contact" && !leadSent && (
                <div className="flex flex-wrap gap-2 pl-1">
                  {suggestions.map((suggestion) => <button key={suggestion.value} type="button" disabled={busy} onClick={() => void sendEvent({ kind: "answer", value: suggestion.value }, suggestion.label)} className="min-h-9 rounded-full border border-[#D7DED3] bg-aster-white px-3.5 text-[11px] font-medium text-aster-forest transition-colors hover:bg-aster-sage disabled:opacity-50">{suggestion.label}</button>)}
                </div>
              )}
              {state.step === "contact" && !leadSent && (
                <form onSubmit={submitContact} className="rounded-xl border border-aster-border bg-aster-white p-3.5">
                  <p className="mb-3 text-[11px] leading-5 text-aster-muted">Share your details only if you’d like Aster Homes to contact you about this request.</p>
                  <div className="grid gap-2.5">
                    <label className="grid gap-1 text-[10px] font-semibold text-aster-ink">Full name<input autoComplete="name" required value={contact.full_name} onChange={(event) => setContact((value) => ({ ...value, full_name: event.target.value }))} className="h-10 rounded-lg border border-aster-border px-3 text-xs font-normal" /></label>
                    <label className="grid gap-1 text-[10px] font-semibold text-aster-ink">Email<input type="email" autoComplete="email" required value={contact.email} onChange={(event) => setContact((value) => ({ ...value, email: event.target.value }))} className="h-10 rounded-lg border border-aster-border px-3 text-xs font-normal" /></label>
                    <label className="grid gap-1 text-[10px] font-semibold text-aster-ink">Phone<input type="tel" inputMode="tel" autoComplete="tel" required value={contact.phone} onChange={(event) => setContact((value) => ({ ...value, phone: event.target.value }))} className="h-10 rounded-lg border border-aster-border px-3 text-xs font-normal" /></label>
                    <label className="flex items-start gap-2 text-[10px] leading-4 text-aster-muted"><input type="checkbox" checked={contact.consent_to_contact} onChange={(event) => setContact((value) => ({ ...value, consent_to_contact: event.target.checked }))} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#355846]" /><span>I’m asking Aster Homes to contact me about property assistance or a consultation. No unrelated marketing. <a href="/privacy" className="font-semibold text-aster-forest underline">Privacy</a>.</span></label>
                    <label className="flex items-start gap-2 text-[10px] leading-4 text-aster-muted"><input type="checkbox" checked={contact.marketing_opt_in} onChange={(event) => setContact((value) => ({ ...value, marketing_opt_in: event.target.checked }))} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#355846]" /><span>Optional: email me occasional home-search updates and helpful resources. I can unsubscribe anytime.</span></label>
                    {contactError && <p role="alert" className="text-[11px] text-[#8E3A32]">{contactError}</p>}
                    <button type="submit" disabled={contactBusy} className="action-control inline-flex min-h-10 items-center justify-center rounded-lg bg-aster-forest px-4 text-sm font-semibold text-white hover:bg-aster-forest-deep disabled:opacity-60">{contactBusy ? "Sending…" : "Send my request"}<Send size={16} aria-hidden="true" /></button>
                  </div>
                </form>
              )}
              {leadSent && <div className="flex justify-end"><button type="button" onClick={restartChat} className="text-[11px] font-semibold text-aster-forest underline underline-offset-2">Start a new search</button></div>}
            </div>

            {(state.step !== "contact" || leadSent) && <form onSubmit={sendText} className="flex shrink-0 items-center gap-2 border-t border-aster-border bg-aster-white px-3.5 py-3 pb-[calc(0.75rem+var(--aster-safe-bottom))] sm:px-4 sm:pb-3">
              <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder={state.step === "location" ? "Type a location…" : "Ask a question…"} aria-label={state.step === "location" ? "Enter preferred location" : "Ask Aster Assistant a question"} className="h-11 min-w-0 flex-1 rounded-lg border border-aster-border bg-[#FBFAF6] px-3 text-[13px] text-aster-ink placeholder:text-[#9A9D95]" />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-aster-forest text-white transition-colors hover:bg-aster-forest-deep disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} aria-hidden="true" /></button>
            </form>}
            <p className="shrink-0 border-t border-aster-border bg-aster-white px-4 py-2 text-center text-[9px] text-aster-muted">{assistantMode === "configured" ? "AI-assisted home-search support" : assistantMode === "unavailable" ? "Assistant temporarily unavailable · home search still works" : "Guided home-search support"}</p>
          </section>
        </div>
      )}
    </>
  );
}
