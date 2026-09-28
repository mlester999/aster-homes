import { describe, expect, it } from "vitest";
import { activitySourceLabel, activityValueLabel, integrationStatusLabel, isInternalDemoTest, maskLeadName, maskPreferredLocation, qualificationStatusLabel, redactActivitySummary } from "@/lib/demo/activity";

describe("demo activity presentation", () => {
  it("masks names while retaining a recognizable internal lead label", () => {
    expect(maskLeadName("Aster Demo Lead")).toBe("A. D. L.");
    expect(maskLeadName("  ")).toBe("Lead");
  });

  it("formats known source and qualification values", () => {
    expect(activitySourceLabel("ai_chat")).toBe("Aster Assistant");
    expect(activityValueLabel("within_30_days")).toBe("Within 30 days");
    expect(integrationStatusLabel("not_configured")).toBe("Not configured");
    expect(qualificationStatusLabel("demo")).toBe("Demo qualification");
  });

  it("keeps full street addresses out of the public activity view", () => {
    expect(maskPreferredLocation("Pine Hollow, Example County")).toBe("Pine Hollow");
    expect(maskPreferredLocation("123 Pine Street, Pine Hollow")).toBe("Specific address hidden");
  });

  it("marks only synthetic test records for internal display", () => {
    expect(isInternalDemoTest("lead@example.test")).toBe(true);
    expect(isInternalDemoTest("lead@example.com", "Synthetic demo test only; do not contact.")).toBe(true);
    expect(isInternalDemoTest("lead@example.com", "Looking near Pine Hollow.")).toBe(false);
  });

  it("removes names, email addresses, and phone numbers from AI summaries", () => {
    const summary = redactActivitySummary(
      "Jane Example is interested in Northhaven. Write jane@example.test or call +1 (415) 555-0182.",
      "Jane Example",
      "Northhaven",
    );

    expect(summary).toBe("the lead is interested in the preferred area. Write [email hidden] or call [phone hidden].");
    expect(summary).not.toContain("Jane Example");
    expect(summary).not.toContain("Northhaven");
    expect(summary).not.toContain("jane@example.test");
    expect(summary).not.toContain("555-0182");
  });
});
