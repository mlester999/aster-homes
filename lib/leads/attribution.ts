export interface PageAttribution {
  page_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

export function getPageAttribution(): PageAttribution {
  if (typeof window === "undefined") {
    return { page_url: null, referrer: null, utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null };
  }
  const query = new URLSearchParams(window.location.search);
  return {
    page_url: window.location.href,
    referrer: document.referrer || null,
    utm_source: query.get("utm_source"),
    utm_medium: query.get("utm_medium"),
    utm_campaign: query.get("utm_campaign"),
    utm_content: query.get("utm_content"),
    utm_term: query.get("utm_term"),
  };
}
