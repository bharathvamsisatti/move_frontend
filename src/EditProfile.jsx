import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, handleAuthError } from "./authClient";

export default function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    alternatePhone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          dateOfBirth: data.dateOfBirth || "",
          alternatePhone: data.alternatePhone || "",
        });
      })
      .catch((err) => handleAuthError(err, navigate))
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await apiFetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      navigate("/profile");
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const initials =
    form.name
      ?.split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  if (loading) {
    return (
      <div style={styles.loaderWrap}>
        <div style={styles.loader} />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Avatar */}
        <div style={styles.header}>
          <div style={styles.avatar}>{initials}</div>
          <h2 style={styles.title}>Edit Profile</h2>
          <p style={styles.subtitle}>Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              style={styles.input}
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* DOB */}
          <div style={styles.field}>
            <label style={styles.label}>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              style={styles.input}
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          {/* Phone */}
          <div style={styles.field}>
            <label style={styles.label}>Alternate Phone</label>
            <input
              name="alternatePhone"
              style={styles.input}
              placeholder="Optional"
              value={form.alternatePhone}
              onChange={handleChange}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="submit"
              style={{
                ...styles.primaryBtn,
                opacity: saving ? 0.7 : 1,
              }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===================== */
/* 🎨 INLINE STYLES */
/* ===================== */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  header: {
    textAlign: "center",
    marginBottom: "24px",
  },

  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "600",
    margin: "0 auto 12px",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "600",
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },

  field: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  primaryBtn: {
    flex: 1,
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "12px 16px",
    background: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    marginTop: "8px",
  },

  loaderWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loader: {
    width: "36px",
    height: "36px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
