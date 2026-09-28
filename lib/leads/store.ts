import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NormalizedLead } from "@/types/lead";
import type { LeadRepository } from "./repository";

const storeDirectory = path.join(process.cwd(), ".demo-data");
const storePath = path.join(storeDirectory, "leads.json");
const inMemoryFallback = new Map<string, NormalizedLead>();
let writeQueue: Promise<unknown> = Promise.resolve();

async function readFileSnapshot(): Promise<NormalizedLead[] | null> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((entry): entry is NormalizedLead => Boolean(entry && typeof entry === "object" && "id" in entry && "idempotency_key" in entry));
  } catch {
    return null;
  }
}

async function currentSnapshot(): Promise<NormalizedLead[]> {
  const persisted = await readFileSnapshot();
  if (persisted) return persisted;
  return [...inMemoryFallback.values()];
}

async function commit(records: NormalizedLead[]): Promise<void> {
  for (const lead of records) inMemoryFallback.set(lead.id, lead);
  await mkdir(storeDirectory, { recursive: true });
  const tempPath = `${storePath}.${process.pid}.tmp`;
  await writeFile(tempPath, JSON.stringify(records, null, 2), "utf8");
  await rename(tempPath, storePath);
}

function exclusive<T>(operation: () => Promise<T>): Promise<T> {
  const task = writeQueue.then(operation, operation);
  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}

class JsonLeadRepository implements LeadRepository {
  async upsertByIdempotencyKey(lead: NormalizedLead) {
    return exclusive(async () => {
      const records = await currentSnapshot();
      const existing = records.find((record) => record.idempotency_key === lead.idempotency_key && Date.now() - Date.parse(record.submitted_at) < 24 * 60 * 60 * 1000);
      if (existing) {
        const merged: NormalizedLead = {
          ...existing,
          ...lead,
          id: existing.id,
          submitted_at: existing.submitted_at,
          crm: existing.crm,
          automation: existing.automation,
          ai_qualification: existing.ai_qualification,
          updated_at: lead.updated_at,
        };
        const next = records.map((record) => record.id === existing.id ? merged : record);
        try {
          await commit(next);
        } catch {
          inMemoryFallback.set(merged.id, merged);
        }
        return { lead: merged, duplicate: true };
      }

      try {
        await commit([lead, ...records].slice(0, 500));
      } catch {
        inMemoryFallback.set(lead.id, lead);
      }
      return { lead, duplicate: false };
    });
  }

  async update(id: string, updates: Partial<NormalizedLead>) {
    return exclusive(async () => {
      const records = await currentSnapshot();
      const existing = records.find((record) => record.id === id) ?? inMemoryFallback.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...updates, id, updated_at: new Date().toISOString() };
      const next = [updated, ...records.filter((record) => record.id !== id)];
      try {
        await commit(next);
      } catch {
        inMemoryFallback.set(id, updated);
      }
      return updated;
    });
  }

  async list() {
    await writeQueue;
    const records = await currentSnapshot();
    return records.sort((a, b) => Date.parse(b.submitted_at) - Date.parse(a.submitted_at)).slice(0, 200);
  }
}

export const leadRepository: LeadRepository = new JsonLeadRepository();
