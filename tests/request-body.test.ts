import { describe, expect, it } from "vitest";
import { readJsonRequest } from "@/lib/security/read-json-request";

describe("bounded request body parsing", () => {
  it("parses valid JSON under the configured limit", async () => {
    const request = new Request("https://aster.example/api", { method: "POST", body: JSON.stringify({ name: "Aster" }) });
    await expect(readJsonRequest(request, 100)).resolves.toEqual({ ok: true, value: { name: "Aster" } });
  });

  it("rejects oversized payloads even when Content-Length is absent", async () => {
    const request = new Request("https://aster.example/api", { method: "POST", body: "x".repeat(100) });
    expect(await readJsonRequest(request, 10)).toEqual({ ok: false, status: 413 });
  });

  it("returns a safe parse failure for malformed JSON", async () => {
    const request = new Request("https://aster.example/api", { method: "POST", body: "{" });
    expect(await readJsonRequest(request, 10)).toEqual({ ok: false, status: 400 });
  });
});
