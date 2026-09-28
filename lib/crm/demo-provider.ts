import type { CRMProvider } from "./types";

export class DemoCRMProvider implements CRMProvider {
  async syncLead() {
    return { status: "not_configured" as const };
  }

  async updateQualification() {
    return { status: "not_configured" as const };
  }
}
