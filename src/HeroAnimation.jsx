// src/HeroAnimation.jsx
import React from "react";
import "./home.css";

export default function HeroAnimation({ company = "NeonPool" }) {
  return (
    <section className="ha-section" aria-label="Animated car section">
      <div className="ha-stage">
        <div className="ha-city" aria-hidden></div>
        <div className="ha-road" aria-hidden>
          <div className="ha-lane" />
          <div className="ha-lane" />
        </div>

        {/* Car with company name on its body */}
        <div className="ha-car-wrap" role="img" aria-label={`Car with ${company} branding`}>
          <svg className="ha-car" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            {/* car body */}
            <g transform="translate(0,0)">
              <rect x="30" y="36" rx="10" ry="10" width="220" height="46" fill="currentColor" />
              <rect x="80" y="16" rx="8" ry="8" width="110" height="36" fill="currentColor" opacity="0.95" />
              {/* windows */}
              <rect x="86" y="20" width="40" height="20" rx="3" fill="#ffffff33" />
              <rect x="136" y="20" width="44" height="20" rx="3" fill="#ffffff33" />
              {/* wheels */}
              <circle cx="90" cy="92" r="12" fill="#fff" />
              <circle cx="210" cy="92" r="12" fill="#fff" />
              <circle cx="90" cy="92" r="7" fill="#000" />
              <circle cx="210" cy="92" r="7" fill="#000" />
              {/* company name on car body */}
              <text x="150" y="62" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="14" fill="#021021">
                {company}
              </text>
            </g>
          </svg>

          <div className="ha-shadow" />
        </div>
      </div>

      <div className="ha-cta">
      </div>
    </section>
  );
}
