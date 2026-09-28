import type { NormalizedLead } from "@/types/lead";

export interface LeadRepository {
  upsertByIdempotencyKey(lead: NormalizedLead): Promise<{ lead: NormalizedLead; duplicate: boolean }>;
  update(id: string, updates: Partial<NormalizedLead>): Promise<NormalizedLead | null>;
  list(): Promise<NormalizedLead[]>;
}
