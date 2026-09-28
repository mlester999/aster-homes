"use client";

import type { ButtonHTMLAttributes } from "react";
import type { LeadSource, PropertyType } from "@/types/lead";
import { useLeadFlow } from "@/components/lead-flow-provider";

interface LeadActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  source?: LeadSource;
  sourceDetail?: string | null;
  propertyType?: Exclude<PropertyType, "open">;
}

export function LeadActionButton({ source = "landing_form", sourceDetail, propertyType, className, onClick, type = "button", ...props }: LeadActionButtonProps) {
  const { openLeadFlow } = useLeadFlow();
  return (
    <button
      {...props}
      type={type}
      className={className ? `action-control ${className}` : "action-control"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openLeadFlow({ source, sourceDetail, propertyType });
      }}
    />
  );
}

export function ChatActionButton({ className, onClick, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { openChat } = useLeadFlow();
  return (
    <button
      {...props}
      type={type}
      className={className ? `action-control ${className}` : "action-control"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openChat();
      }}
    />
  );
}
