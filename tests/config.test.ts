import { afterEach, describe, expect, it, vi } from "vitest";
import { isDemoMode } from "@/lib/config";

afterEach(() => vi.unstubAllEnvs());

describe("demo mode selection", () => {
  it("keeps demo providers disabled unless explicitly enabled", () => {
    vi.stubEnv("DEMO_MODE", "");
    expect(isDemoMode()).toBe(false);

    vi.stubEnv("DEMO_MODE", "false");
    expect(isDemoMode()).toBe(false);

    vi.stubEnv("DEMO_MODE", "true");
    expect(isDemoMode()).toBe(true);
  });
});
