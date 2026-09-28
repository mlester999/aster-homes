"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { LeadSource, PropertyType } from "@/types/lead";
import { LeadQualificationDialog } from "@/components/forms/lead-qualification-dialog";
import { ChatAssistant } from "@/components/chat/chat-assistant";

export interface LeadFlowRequest {
  source?: LeadSource;
  sourceDetail?: string | null;
  propertyType?: Exclude<PropertyType, "open">;
}

interface LeadFlowContextValue {
  openLeadFlow: (request?: LeadFlowRequest) => void;
  openChat: () => void;
  closeChat: () => void;
}

const LeadFlowContext = createContext<LeadFlowContextValue | null>(null);

export function useLeadFlow() {
  const context = useContext(LeadFlowContext);
  if (!context) throw new Error("useLeadFlow must be used within LeadFlowProvider");
  return context;
}

export function LeadFlowProvider({ children, bookingUrl }: { children: ReactNode; bookingUrl: string | null }) {
  const [leadRequest, setLeadRequest] = useState<LeadFlowRequest | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const openLeadFlow = useCallback((request: LeadFlowRequest = {}) => {
    setLeadRequest({ source: "landing_form", ...request });
  }, []);
  const closeLeadFlow = useCallback(() => setLeadRequest(null), []);
  const value = useMemo<LeadFlowContextValue>(() => ({
    openLeadFlow,
    openChat: () => setChatOpen(true),
    closeChat: () => setChatOpen(false),
  }), [openLeadFlow]);

  return (
    <LeadFlowContext.Provider value={value}>
      {children}
      {leadRequest && <LeadQualificationDialog
        open
        request={leadRequest}
        bookingUrl={bookingUrl}
        onClose={closeLeadFlow}
      />}
      <ChatAssistant open={chatOpen} bookingUrl={bookingUrl} onOpen={() => setChatOpen(true)} onClose={() => setChatOpen(false)} />
    </LeadFlowContext.Provider>
  );
}
