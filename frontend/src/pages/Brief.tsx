import { useEffect, useState } from "react";
import "./Brief.css";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type Language = "en" | "hi" | "both";

interface BriefResponse {
  festival: string;
  en: string;
  hi: string;
  source: "llm" | "template";
  numbers_validated: boolean;
}

export default function Brief({ festival }: { festival: string }) {
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>("en");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setBrief(null);

    fetch(`${BASE}/api/brief?festival=${festival}`)
      .then((res) => {
        if (res.status === 501) throw new Error("501");
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: BriefResponse) => {
        setBrief(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message === "501") {
          setError(
            "Brief needs the ranking. It will appear once scoring is ready."
          );
        } else {
          setError("Could not load the brief. Check if the backend is running.");
        }
        setLoading(false);
      });
  }, [festival]);

  const displayText = brief
    ? lang === "both"
      ? `${brief.en}\n\n${brief.hi}`
      : lang === "en"
        ? brief.en
        : brief.hi
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
    } catch {
      // Fallback for non-HTTPS (localhost)
      const ta = document.createElement("textarea");
      ta.value = displayText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const cls = "printing-brief";
    document.body.classList.add(cls);
    window.addEventListener("afterprint", () => document.body.classList.remove(cls), { once: true });
    window.print();
  };

  if (loading) {
    return (
      <div className="brief-container">
        <p className="brief-loading">Preparing brief…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brief-container">
        <p className="notice">{error}</p>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div className="brief-container">
      <div className="brief-header">
        <h2>Brief · {festival}</h2>
        <div className="brief-lang-toggle" role="group" aria-label="Language">
          <button
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            aria-pressed={lang === "hi"}
            onClick={() => setLang("hi")}
          >
            हिंदी
          </button>
          <button
            aria-pressed={lang === "both"}
            onClick={() => setLang("both")}
          >
            Both
          </button>
        </div>
      </div>

      <div className="brief-body" id="brief-print-area">
        {(lang === "en" || lang === "both") && (
          <pre className="brief-text" lang="en">
            {brief.en}
          </pre>
        )}
        {lang === "both" && <hr className="brief-divider" />}
        {(lang === "hi" || lang === "both") && (
          <pre className="brief-text brief-text-hi" lang="hi">
            {brief.hi}
          </pre>
        )}
      </div>

      <div className="brief-meta">
        <span className="brief-source">
          {brief.source === "llm"
            ? "AI-rephrased · numbers checked against computed data"
            : "Template text · numbers checked"}
        </span>
        <div className="brief-actions">
          <button className="brief-btn" onClick={handleCopy}>
            Copy
          </button>
          <button className="brief-btn" onClick={handlePrint}>
            Print
          </button>
          <span className="brief-copied" aria-live="polite">
            {copied ? "Copied ✓" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
