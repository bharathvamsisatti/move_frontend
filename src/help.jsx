import React from "react";
import { useNavigate } from "react-router-dom";

// Styles copied from Homepage.jsx
const helpWrapper = {
  width: "100%",
  margin: 0,
  padding: "36px 40px 0",
  boxSizing: "border-box",
};

const helpPanel = {
  background: "#ffffff",
  borderRadius: 14,
  padding: "36px",
  color: "#2d3748",
  boxShadow: "0 24px 60px rgba(0,0,0,0.1)",
  boxSizing: "border-box",
};

const helpTitle = {
  fontSize: 22,
  fontWeight: 800,
  color: "#1a365d",
  textAlign: "center",
  margin: 0,
};
const helpIntro = {
  color: "#4a5568",
  textAlign: "center",
  marginTop: 10,
  marginBottom: 20,
  lineHeight: 1.55,
  fontSize: 15,
};

const gridColsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 360px 1fr",
  gap: 48,
  alignItems: "start",
};

const sectionBlock = { marginBottom: 24 };
const blockHeading = {
  fontSize: 16,
  fontWeight: 700,
  color: "#2b6cb0",
  marginBottom: 12,
};

const faqList = { margin: 0, padding: 0, listStyle: "none" };
const faqItem = {
  background: "#f7fafc",
  padding: "14px 16px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  marginBottom: 20,
  color: "#2d3748",
  fontSize: 15,
  lineHeight: 1.5,
};

const contactBox = {
  background: "#f7fafc",
  padding: "18px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  textAlign: "center",
  color: "#2d3748",
};

const resourceList = { display: "flex", gap: 12, flexDirection: "column", marginTop: 8 };
const resourceBtn = {
  background: "#f7fafc",
  color: "#3182ce",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  transition: "background-color 0.2s",
};



const subscribeRow = {
  display: "flex",
  gap: 8,
  marginTop: 12,
  alignItems: "center",
};
const subscribeInput = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#2d3748",
  outline: "none",
  fontSize: 14,
};

const smallFooter = {
  marginTop: 18,
  borderTop: "1px solid #e2e8f0",
  paddingTop: 12,
  color: "#718096",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  fontSize: 13,
};

export default function Help() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", color: "#2d3748" }}>
      <main>
        <section id="help" aria-label="Help and Support">
          <div style={helpWrapper}>
            <div style={helpPanel}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={helpTitle}>Help & Support</h3>
                <p style={helpIntro}>Clear, organized answers and links so you can quickly find what you need.</p>
              </div>

              <div style={gridColsStyle}>
                {/* LEFT column (FAQ) */}
                <div>
                  <div style={sectionBlock}>
                    <div style={blockHeading}>Frequently asked</div>
                    <ul style={faqList}>
                      <li style={faqItem}>
                        <div style={{ fontWeight: 800 }}>How do I offer a ride?</div>
                        <div style={{ marginTop: 8, color: "#4a5568" }}>
                          Click "Offer Ride" in the top navigation, enter route, date/time and available seats, then publish. Riders request to join; accept or decline requests on the ride page.
                        </div>
                      </li>

                      <li style={faqItem}>
                        <div style={{ fontWeight: 800 }}>How are fares calculated?</div>
                        <div style={{ marginTop: 8, color: "#4a5568" }}>
                          Fares estimate distance-based fuel/toll costs. Hosts can override the suggested fare before publishing; riders see the final price when requesting.
                        </div>
                      </li>

                      <li style={faqItem}>
                        <div style={{ fontWeight: 800 }}>What safety measures exist?</div>
                        <div style={{ marginTop: 8, color: "#4a5568" }}>
                          Identity verification during signup, ratings, ride history, and reporting options. Contact support for urgent incidents.
                        </div>
                      </li>

                      <li style={faqItem}>
                        <div style={{ fontWeight: 800 }}>Can I set recurring rides?</div>
                        <div style={{ marginTop: 8, color: "#4a5568" }}>
                          Yes — choose the scheduling option when offering a ride to repeat on selected days/times.
                        </div>
                      </li>

                      <li style={faqItem}>
                        <div style={{ fontWeight: 800 }}>How do I cancel a ride?</div>
                        <div style={{ marginTop: 8, color: "#4a5568" }}>
                          Open your offered ride, select "Cancel", confirm; riders are notified and refunds follow policy rules.
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* CENTER column (Contact) */}
                <div>
                  <div style={sectionBlock}>
                    <div style={blockHeading}>Contact support</div>
                    <div style={contactBox}>
                      <div>If the FAQ doesn't help, contact our support team — we reply during business hours.</div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ color: "#3182ce", fontWeight: 800, fontSize: 15 }}>support@move.example</div>
                        <div style={{ marginTop: 8, fontWeight: 800, fontSize: 15 }}>+91 98765 43210</div>
                        <div style={{ marginTop: 8 }}>Support hours: Mon–Sat 09:00–18:00 IST</div>
                      </div>

                      <div style={{ marginTop: 14, display: "flex", gap: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                        <button onClick={() => navigate("/contact")} style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>
                          Contact Us
                        </button>

                        <button onClick={() => navigate("/help")} style={{ background: "#f7fafc", border: "1px solid #e2e8f0", color: "#2d3748", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                          Help center
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT column (Resources + subscribe) */}
                <div>
                  <div style={sectionBlock}>
                    <div style={blockHeading}>Resources</div>
                    <div style={{ marginBottom: 10 }}>Useful links and policies for riders and drivers.</div>

                    <div style={resourceList}>
                      <button style={resourceBtn} onClick={() => navigate("/terms")}>Terms of Service</button>
                      <button style={resourceBtn} onClick={() => navigate("/privacy")}>Privacy Policy</button>
                      <button style={resourceBtn} onClick={() => navigate("/safety")}>Safety Guidelines</button>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Subscribe for updates</div>
                      <div style={subscribeRow}>
                        <input aria-label="Email for updates" placeholder="you@company.com" style={subscribeInput} type="email" />
                        <button onClick={() => alert("Subscribed (placeholder)")} style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed)", border: "none", color: "#fff", padding: "10px 14px", borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>
                          Subscribe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* inner legal row */}
              <div style={smallFooter}>
                <div>© {new Date().getFullYear()} MOVE — All rights reserved.</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ color: "#ff7b7b" }}>❤</div>
                  <div>Made with love for safer, greener travel.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
