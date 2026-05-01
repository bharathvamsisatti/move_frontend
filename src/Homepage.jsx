import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./home.css";
import "./about.css";
import "./features.css";
import HeroAnimation from "./HeroAnimation";
import ThemeToggle from "./ThemeToggle";
import FancyBtn from "./FancyBtn";

import { isLoggedIn, clearToken } from "./authClient";

/**
 * Updated HomePage:
 * - Improved spacing, readable text sizes, and mobile-friendly buttons.
 * - Shows a dismissible "Registered — please login" banner when /?registered=true.
 * - Keeps existing behavior: nav, conditional CTAs, profile menu, IntersectionObserver.
 * - Help section moved to separate /help route.
 *
 * Added additional feature cards (low cost travel, best rated drivers, real-time updates, flexible pickup).
 */

export default function HomePage() {
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const navRef = useRef(null);
  const bannerRef = useRef(null);

  const [active, setActive] = useState("home");
  const [spacerHeight, setSpacerHeight] = useState(72);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);

  // Auth / profile menu state
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // window width for responsive help layout
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
      // also update nav spacer (keeps nav measurement in one place)
      const h = navRef.current
        ? Math.ceil(navRef.current.getBoundingClientRect().height)
        : 72;
      setSpacerHeight(Math.ceil(h));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // keep loggedIn synced
  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  // Show register success banner if URL has ?registered=true
  useEffect(() => {
    let autoHideTimer;
    // If user came from registration with ?registered=true
    if (searchParams.get("registered") === "true") {
      setShowRegisterSuccess(true);

      // remove the param from URL so it doesn't show again on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("registered");
      // replace state so history isn't polluted
      setSearchParams(newParams, { replace: true });

      // focus the banner for screen readers / keyboard users
      setTimeout(() => {
        try {
          bannerRef.current?.focus();
        } catch (e) {
          // ignore
        }
      }, 120);

      // auto-hide after 8s
      autoHideTimer = setTimeout(() => {
        setShowRegisterSuccess(false);
      }, 800000);
    }
    return () => {
      if (autoHideTimer) clearTimeout(autoHideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount; search param already baked into location

  // IntersectionObserver for sections (about / features)
  useEffect(() => {
    const sections = [aboutRef, featuresRef]
      .map((r) => r.current || null)
      .filter(Boolean);

    if (!sections.length) return;

    const navH = navRef.current
      ? Math.ceil(navRef.current.getBoundingClientRect().height)
      : 72;
    const topMargin = navH + 20;
    const rootMargin = `-${topMargin}px 0px -10% 0px`;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            setActive(id);
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      { threshold: 0.32, rootMargin }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [spacerHeight]);

  function scrollToRef(ref) {
    if (!ref || !ref.current) return;

    const navEl = navRef.current || document.querySelector(".np-nav-top");
    const navH = navEl ? navEl.getBoundingClientRect().height : 0;
    const rect = ref.current.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - navH - 12;

    window.scrollTo({ top: targetY, behavior: "smooth" });

    // focus heading for a11y
    ref.current.classList.add("in-view");
    const heading = ref.current.querySelector("h2, h3");
    if (heading) {
      setTimeout(() => {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }, 420);
    }
  }

  function handleNav(name) {
    switch (name) {
      case "about":
        scrollToRef(aboutRef);
        break;
      case "features":
        scrollToRef(featuresRef);
        break;
      case "help":
        navigate("/help");
        break;
      default:
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActive("home");
    }
  }

  // CTA handlers
  function handleSignup() {
    navigate("/register");
  }
  function handleLogin() {
    navigate("/login");
  }
  function handleOfferRide() {
    navigate("/offer-ride");
  }
  function handleFindRide() {
    navigate("/find-ride");
  }

  // Profile menu actions
  function handleLogout() {
    clearToken();
    setLoggedIn(false);
    setShowProfileMenu(false);
    navigate("/");
  }
  function handleGoProfile() {
    navigate("/profile");
    setShowProfileMenu(false);
  }
  function handleMyBookings() {
    navigate("/my-bookings");
    setShowProfileMenu(false);
  }
  function handleMyRides() {
    navigate("/my-rides");
    setShowProfileMenu(false);
  }

  // responsive column setup: 3 columns on large, 2 on medium, 1 on small
  const helpColumns = (() => {
    if (windowWidth >= 1100) return "1fr 420px 1fr";
    if (windowWidth >= 760) return "1fr 360px"; // two columns: left + center (stack right under)
    return "1fr"; // single column stacked
  })();

  // helpers for responsive sizes
  const isSingleColumn = windowWidth < 760;
  const centerAlign = isSingleColumn ? { textAlign: "left" } : { textAlign: "center" };

  // ---------- Styles ----------
  const helpWrapper = {
    width: "100%",
    maxWidth: 1100,
    margin: "36px auto",
    padding: "0 20px",
    boxSizing: "border-box",
  };

  const helpPanel = {
    background: "linear-gradient(180deg,#071827 0%,#04232b 100%)",
    borderRadius: 14,
    padding: isSingleColumn ? 20 : 36,
    color: "#e6f7fb",
    boxShadow: "0 24px 60px rgba(3,10,18,0.28)",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  const helpTitle = {
    fontSize: isSingleColumn ? 18 : 22,
    fontWeight: 800,
    color: "#cfeffb",
    textAlign: "center",
    margin: 0,
  };
  const helpIntro = {
    color: "rgba(230,247,251,0.9)",
    textAlign: "center",
    marginTop: 10,
    marginBottom: isSingleColumn ? 14 : 20,
    lineHeight: 1.55,
    fontSize: isSingleColumn ? 14 : 15,
  };

  const gridColsStyle = {
    display: "grid",
    gridTemplateColumns: helpColumns,
    gap: isSingleColumn ? 14 : 24,
    alignItems: "start",
  };

  const sectionBlock = { marginBottom: isSingleColumn ? 14 : 20 };
  const blockHeading = {
    fontSize: 16,
    fontWeight: 700,
    color: "#dff9ff",
    marginBottom: 12,
  };

  const faqList = { margin: 0, padding: 0, listStyle: "none" };
  const faqItem = {
    background: "rgba(255,255,255,0.02)",
    padding: isSingleColumn ? "12px 12px" : "14px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.03)",
    marginBottom: 12,
    color: "rgba(230,247,251,0.95)",
    fontSize: isSingleColumn ? 14 : 15,
    lineHeight: 1.5,
  };

  const contactBox = {
    background: "rgba(255,255,255,0.02)",
    padding: isSingleColumn ? 12 : 18,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.03)",
    textAlign: isSingleColumn ? "left" : "center",
    color: "rgba(230,247,251,0.95)",
  };

  const resourceList = { display: "flex", gap: 8, flexDirection: "column", marginTop: 8 };
  const resourceBtn = {
    background: "rgba(255,255,255,0.03)",
    color: "#dff9ff",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.03)",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  };

  const subscribeRow = {
    display: "flex",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
    width: "100%",
  };
  const subscribeInput = {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    color: "#e6f7fb",
    outline: "none",
    fontSize: 14,
  };

  const fullWidthOnMobile = (elStyle) =>
    isSingleColumn ? { ...elStyle, width: "100%" } : elStyle;

  const smallFooter = {
    marginTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.03)",
    paddingTop: 12,
    color: "rgba(230,247,251,0.7)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 13,
  };

  // banner styles
  const successBanner = {
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(90deg,#ecfdf5,#d1fae5)",
    color: "#064e3b",
    padding: "10px 12px",
    borderRadius: 10,
    boxShadow: "0 6px 18px rgba(6,95,70,0.08)",
    marginTop: 12,
    width: "100%",
    boxSizing: "border-box",
  };
  const bannerText = { fontSize: 14, fontWeight: 700 };
  const bannerActions = { display: "flex", gap: 8, alignItems: "center" };
  const bannerBtn = {
    background: "#047857",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 800,
    cursor: "pointer",
  };
  const bannerDismiss = {
    background: "transparent",
    border: "none",
    color: "#065f46",
    padding: "6px 8px",
    cursor: "pointer",
    fontWeight: 700,
  };

  // ------------------ Inline Feature section styles ------------------
  const featuresSectionStyle = {
    padding: 48,
    background: "#f8fafc",
    textAlign: "center",
  };
  const featuresTitleStyle = {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 8,
  };
  const featuresSubtitleStyle = {
    color: "#64748b",
    marginBottom: 28,
    maxWidth: 820,
    marginLeft: "auto",
    marginRight: "auto",
  };
  const featuresGridStyle = {
    display: "grid",
    gridTemplateColumns: windowWidth >= 1000 ? "repeat(4,1fr)" : windowWidth >= 800 ? "repeat(3,1fr)" : windowWidth >= 600 ? "repeat(2,1fr)" : "1fr",
    gap: 18,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 18px",
  };
  const featureCardStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    transition: "transform 0.18s ease",
    textAlign: "left",
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  };
  const featureIconStyle = { fontSize: 34, display: "inline-block", width: 48, textAlign: "center" };
  const featureTitleStyle = { marginTop: 8, fontSize: 16, fontWeight: 700 };
  const featureDescStyle = { marginTop: 8, fontSize: 14, color: "#475569", flex: 1 };

  // --------------------------------------------------------------------

  return (
    <div className="np-page">
      {/* NAV */}
      <nav
        className="np-nav-top"
        role="navigation"
        aria-label="Main navigation"
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100vw",
          zIndex: 9999,
        }}
      >
        <div className="np-nav-inner">
          <div className="np-left">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNav("home");
              }}
              className="np-logo-link"
              aria-label="MOVE home"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <video
                className="np-logo-video"
                src="/logo.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                width="56"
                height="56"
                style={{ borderRadius: 10, objectFit: "cover", display: "block" }}
              />
            </a>
          </div>

          <div className="np-right">
            <ul className="np-nav-pills" role="menubar" aria-label="Primary navigation">
              <li role="none">
                <button
                  role="menuitem"
                  className={`np-pill np-pill-neutral ${active === "home" ? "np-pill-active" : ""}`}
                  onClick={() => handleNav("home")}
                  aria-current={active === "home" ? "page" : undefined}
                >
                  Home
                </button>
              </li>

              <li role="none">
                <button
                  role="menuitem"
                  className={`np-pill np-pill-info ${active === "about" ? "np-pill-active" : ""}`}
                  onClick={() => handleNav("about")}
                >
                  About
                </button>
              </li>

              <li role="none">
                <button
                  role="menuitem"
                  className={`np-pill np-pill-info ${active === "features" ? "np-pill-active" : ""}`}
                  onClick={() => handleNav("features")}
                >
                  Features
                </button>
              </li>

              {loggedIn && (
                <>
                  <li role="none">
                    <button role="menuitem" className="np-pill np-pill-action" onClick={handleOfferRide}>
                      Offer Ride
                    </button>
                  </li>

                  <li role="none">
                    <button role="menuitem" className="np-pill np-pill-action" onClick={handleFindRide}>
                      Find Ride
                    </button>
                  </li>
                </>
              )}

              <li role="none">
                <button
                  role="menuitem"
                  className={`np-pill np-pill-info ${active === "help" ? "np-pill-active" : ""}`}
                  onClick={() => handleNav("help")}
                >
                  Help
                </button>
              </li>
            </ul>

            <div className="np-nav-controls" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ThemeToggle />

              {/* profile icon */}
              <div
                className="np-profile"
                style={{ position: "relative" }}
                onMouseEnter={() => setShowProfileMenu(true)}
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <button
                  className="np-profile-icon"
                  aria-haspopup="true"
                  aria-expanded={showProfileMenu}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f1f5f9",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                >
                  👤
                </button>

                {showProfileMenu && (
                  <div
                    className="np-profile-menu"
                    role="menu"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      minWidth: 200,
                      background: "var(--card-bg, #fff)",
                      borderRadius: 10,
                      boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      zIndex: 20000,
                    }}
                  >
                    {!loggedIn ? (
                      <>
                        <button
                          role="menuitem"
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogin();
                          }}
                          style={{ border: "none", background: "transparent", padding: "8px 10px", textAlign: "left", cursor: "pointer", borderRadius: 6 }}
                        >
                          Login
                        </button>

                        <button
                          role="menuitem"
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleSignup();
                          }}
                          style={{ border: "none", background: "transparent", padding: "8px 10px", textAlign: "left", cursor: "pointer", borderRadius: 6 }}
                        >
                          Sign Up
                        </button>
                      </>
                    ) : (
                      <>
                        <button role="menuitem" onClick={handleGoProfile} style={{ border: "none", background: "transparent", padding: "8px 10px", textAlign: "left", cursor: "pointer", borderRadius: 6 }}>
                          My Profile
                        </button>

                        <button role="menuitem" onClick={handleMyBookings} style={{ border: "none", background: "transparent", padding: "8px 10px", textAlign: "left", cursor: "pointer", borderRadius: 6 }}>
                          My Bookings
                        </button>

                        <button role="menuitem" onClick={handleMyRides} style={{ border: "none", background: "transparent", padding: "8px 10px", textAlign: "left", cursor: "pointer", borderRadius: 6 }}>
                          My Offered Rides
                        </button>

                        <hr style={{ border: "none", borderTop: "1px solid rgba(2,6,23,0.06)", margin: "6px 0" }} />

                        <button role="menuitem" onClick={handleLogout} style={{ border: "none", background: "transparent", padding: "8px 10px", textAlign: "left", cursor: "pointer", borderRadius: 6, color: "#dc2626" }}>
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* spacer */}
      <div aria-hidden style={{ height: spacerHeight }} />

      <main>
        {/* HERO */}
        <header className="np-hero" aria-label="Hero" id="home">
          <div className="np-hero-content">
            <h1 className="np-title">
              Share Rides.
              <br />
              Save Money.
              <br />
              <span className="np-title-color">Travel Together.</span>
            </h1>

            <p className="np-sub">
              Welcome to MOVE — India’s modern carpooling platform. Reduce traffic, split fuel costs, and ride safely with verified users.
            </p>

            {/* Registered success banner */}
            {showRegisterSuccess && (
              <div
                ref={bannerRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
                style={successBanner}
              >
                <div style={bannerText}>
                  Registered successfully — please login to continue.
                </div>

                <div style={bannerActions}>
                  <button
                    onClick={() => {
                      setShowRegisterSuccess(false);
                      handleLogin();
                    }}
                    style={bannerBtn}
                  >
                    Login
                  </button>

                  <button
                    onClick={() => setShowRegisterSuccess(false)}
                    aria-label="Dismiss registration message"
                    style={bannerDismiss}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 18, justifyContent: "flex-start", flexWrap: "wrap" }}>
              {!loggedIn ? (
                <>
                  <FancyBtn onClick={handleSignup}>Get Started</FancyBtn>
                  <FancyBtn onClick={handleLogin}>Login</FancyBtn>
                </>
              ) : (
                <>
                  <FancyBtn onClick={handleOfferRide}>Offer Ride</FancyBtn>
                  <FancyBtn onClick={handleFindRide}>Find Ride</FancyBtn>
                </>
              )}
            </div>
          </div>

          <div className="np-hero-graphic" aria-hidden="true">
            <div className="circle c1" />
            <div className="circle c2" />
            <div className="circle c3" />
            <div className="circle c4" />
          </div>
        </header>

        {/* Hero animation */}
        <HeroAnimation company="MOVE" />

        {/* ABOUT */}
        <section id="about" ref={aboutRef} className="np-about scroll-section" aria-label="About MOVE">
          <div className="container">
            <div className="left-col">
              <h2 tabIndex={-1}>About MOVE</h2>
              <p className="lead">
                MOVE is India’s modern carpooling platform focused on safe, reliable, and affordable shared travel. We connect commuters going the same
                way so everyone saves on fuel, reduces traffic, and travels together.
              </p>

              <div className="about-features">
                <div className="feature">
                  <div className="icon" aria-hidden>🔎</div>
                  <div className="meta"><b>Route Matching</b><span>Find riders and drivers on the same route quickly.</span></div>
                </div>

                <div className="feature">
                  <div className="icon" aria-hidden>📍</div>
                  <div className="meta"><b>Pickup Points</b><span>Define flexible pickup locations and timings.</span></div>
                </div>

                <div className="feature">
                  <div className="icon" aria-hidden>🔒</div>
                  <div className="meta"><b>Safety Checks</b><span>Verified users and ratings keep rides trusted.</span></div>
                </div>

                <div className="feature">
                  <div className="icon" aria-hidden>💳</div>
                  <div className="meta"><b>Easy Payments</b><span>Split costs securely with simple settlement options.</span></div>
                </div>
              </div>
            </div>

            <div className="right-col about-side">
              <div className="about-stats">
                <div className="stat"><span className="num">8.2k+</span><span className="label">Rides Shared</span></div>
                <div className="stat"><span className="num">4.7</span><span className="label">Avg Rating</span></div>
              </div>

              <div className="about-card">
                <h3>Ready to ride together?</h3>
                <p>Offer or find rides in minutes. Join a community that values safety and cost-savings.</p>
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <FancyBtn onClick={() => handleNav("features")}>See Features</FancyBtn>
                  <FancyBtn onClick={() => handleNav("help")}>Get Help</FancyBtn>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES - INLINE STYLED */}
        <section
          id="features"
          ref={featuresRef}
          className="np-features scroll-section"
          aria-label="Features"
          style={featuresSectionStyle}
        >
          <div>
            <h2 style={featuresTitleStyle} tabIndex={-1}>Why choose MOVE?</h2>
            <p style={featuresSubtitleStyle}>
              Smart, secure, and eco-friendly carpooling made simple
            </p>

            <div style={featuresGridStyle}>
              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>🚗</div>
                <div style={featureTitleStyle}>Offer a Ride</div>
                <div style={featureDescStyle}>Publish your ride with route, time, price, and available seats.</div>
              </div>

              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>🔍</div>
                <div style={featureTitleStyle}>Find a Ride</div>
                <div style={featureDescStyle}>Search and book rides easily with verified drivers.</div>
              </div>

              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>🔐</div>
                <div style={featureTitleStyle}>Secure Login</div>
                <div style={featureDescStyle}>Google OAuth & JWT based authentication for safety.</div>
              </div>

              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>📅</div>
                <div style={featureTitleStyle}>Ride Management</div>
                <div style={featureDescStyle}>View upcoming, past, and offered rides in one dashboard.</div>
              </div>

              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>👥</div>
                <div style={featureTitleStyle}>Passenger Control</div>
                <div style={featureDescStyle}>Drivers can view and manage passengers per ride.</div>
              </div>

              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>🌱</div>
                <div style={featureTitleStyle}>Eco Friendly</div>
                <div style={featureDescStyle}>Reduce carbon footprint and travel sustainably.</div>
              </div>

              {/* Additional requested features */}
              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>💸</div>
                <div style={featureTitleStyle}>Low Cost Travel</div>
                <div style={featureDescStyle}>Split fuel and tolls to make commuting affordable for everyone.</div>
              </div>

              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>🏆</div>
                <div style={featureTitleStyle}>Best Rated Drivers</div>
                <div style={featureDescStyle}>See driver ratings and reviews to choose trusted rides.</div>
              </div>

              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>⚡</div>
                <div style={featureTitleStyle}>Real-time Updates</div>
                <div style={featureDescStyle}>Get live ride status, ETA updates and booking confirmations instantly.</div>
              </div>

              <div style={featureCardStyle} tabIndex={0}>
                <div style={featureIconStyle} aria-hidden>🗺️</div>
                <div style={featureTitleStyle}>Flexible Pickup</div>
                <div style={featureDescStyle}>Choose convenient pickup points and coordinate with drivers easily.</div>
              </div>
            </div>

            <div style={{ marginTop: 28, textAlign: "center" }}>
              <div className="note" style={{ color: "#334155" }}>Find a ride or offer one — try a sample search below.</div>
              <div style={{ display: "flex", gap: 12, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <input className="feature-search" type="search" placeholder="Search routes, e.g., Bengaluru → Whitefield" aria-label="Search routes" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(15,23,42,0.06)", minWidth: 220 }} />
                <FancyBtn onClick={() => alert("Search placeholder")}>Search Rides</FancyBtn>
              </div>
            </div>
          </div>
        </section>

        <footer className="np-footer">
      <div className="np-footer-container">
        {/* LEFT: Brand */}
        <div className="footer-col">
          <h2 className="footer-logo">MOVE</h2>
          <p className="footer-text">
            Connecting people and places. Your trusted carpooling companion for
            safe, affordable, and eco-friendly travel.
          </p>
        </div>

        {/* CENTER: Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#" onClick={(e) => {e.preventDefault(); navigate("/help");}}>Help</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>

        {/* RIGHT: Contact */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p className="footer-contact">
            📧 support@move.example
          </p>
          <p className="footer-contact">
            📞 +91 98765 43210
          </p>
        </div>

        {/* NEWSLETTER */}
        <div className="footer-col">
          <h4>Newsletter</h4>
          <p className="footer-text">
            Subscribe for updates and travel tips.
          </p>
          <div className="footer-newsletter">
            <input type="email" placeholder="Enter your email" />
            <button aria-label="Subscribe">➤</button>
          </div>
        </div>
      </div>

      {/* SOCIAL */}
      <div className="footer-social">
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><img src="/linkedIn.jpg" alt="LinkedIn" className="social-icon" /></a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><img src="/insta.jpg" alt="Instagram" className="social-icon" /></a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><img src="/facebook.jpg" alt="Facebook" className="social-icon" /></a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><img src="/twitter.jpg" alt="Twitter" className="social-icon" /></a>
      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        © 2025 MOVE — All rights reserved
        <div className="footer-made">
          Made with <span>❤️</span> for travel
        </div>
      </div>
    </footer>
      </main>
    </div>
  );
}