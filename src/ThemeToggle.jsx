// src/ThemeToggle.jsx
import React, { useEffect, useState } from "react";
import "./home.css"; // ensure styles are loaded for toggle icons

export default function ThemeToggle() {
  const LS_KEY = "neonpool-theme";
  const [checked, setChecked] = useState(false); // checked === dark mode enabled
  const [pristine, setPristine] = useState(true);

  // initialize theme on mount
  useEffect(() => {
    const saved = (() => {
      try { return localStorage.getItem(LS_KEY); } catch { return null; }
    })();

    let initial = "light"; // user asked for light as default
    if (saved === "light" || saved === "dark") {
      initial = saved;
    } else {
      const prefersLight = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
      // prefer OS preference, default to light when unknown
      initial = prefersLight ? "light" : "dark";
    }

    document.documentElement.setAttribute("data-theme", initial);
    // store checked state as dark-mode flag: checked === true means dark theme
    setChecked(initial === "dark");
  }, []);

  // toggle handler
  function onToggle(e) {
    if (pristine) setPristine(false);
    const toDark = e.target.checked;
    setChecked(toDark);
    const theme = toDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(LS_KEY, theme); } catch (_) {}
  }

  return (
    <div className="theme-toggle-wrap" title="Toggle light / dark">
      <label className="theme-toggle" htmlFor="neon-theme-toggle">
        <input
          id="neon-theme-toggle"
          name="toggle"
          type="checkbox"
          className={pristine ? "pristine" : ""}
          checked={checked}
          onChange={onToggle}
          aria-label="Toggle dark mode" />
        <span className="tt-track" aria-hidden>
          <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="4" />
            <g stroke="none" fill="none" strokeWidth="0">
              {/* decorative rays via CSS background or pseudo elements */}
            </g>
          </svg>

          <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden>
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </span>
      </label>
    </div>
  );
}