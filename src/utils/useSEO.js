import { useEffect } from "react";

const SITE_NAME = "SIUT — Internship Portal";

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSEO({ title, description, noIndex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — SIUT` : SITE_NAME;
    document.title = fullTitle;

    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, noIndex]);
}
