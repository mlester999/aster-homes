"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en"><body style={{ margin: 0, background: "#f6f4ee", color: "#27332b", fontFamily: "Arial, sans-serif" }}><main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24, textAlign: "center" }}><div><h1 style={{ fontSize: 36, fontWeight: 400 }}>Aster Homes is having a moment.</h1><p>Please try loading the page again.</p><button onClick={() => reset()} style={{ padding: "12px 18px", border: 0, borderRadius: 8, background: "#355846", color: "white", cursor: "pointer" }}>Try again</button></div></main></body></html>
  );
}
