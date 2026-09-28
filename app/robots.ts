import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${canonicalSiteUrl().replace(/\/$/, "")}/sitemap.xml`,
  };
}
