import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = canonicalSiteUrl().replace(/\/$/, "");
  return ["", "/privacy", "/terms"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path ? "yearly" : "monthly",
    priority: path ? 0.3 : 1,
  }));
}
