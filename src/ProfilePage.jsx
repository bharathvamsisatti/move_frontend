// // src/ProfilePage.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./profile.css";
// import { apiFetch, clearToken } from "./authClient";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

 export default function ProfilePage() {
//   const navigate = useNavigate();

//   const [profile, setProfile] = useState({
//     userName: "",
//     email: "",
//     phoneNumber: "",
//     city: "",
//     state: "",
//     country: "",
//     gender: "",
//     about: "",
//   });

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     apiFetch(`${API_BASE}/api/users/me`)
//       .then((data) => {
//         setProfile({
//           userName: data.userName || "",
//           email: data.email || "",
//           phoneNumber: data.phoneNumber || "",
//           city: data.city || "",
//           state: data.state || "",
//           country: data.country || "",
//           gender: data.gender || "",
//           about: data.about || "",
//         });
//       })
//       .catch(() => navigate("/login?expired=true"))
//       .finally(() => setLoading(false));
//   }, [navigate]);

//   function handleChange(e) {
//     const { name, value } = e.target;
//     setProfile((p) => ({ ...p, [name]: value }));
//   }

//   async function saveProfile(e) {
//     e.preventDefault();
//     setSaving(true);
//     setMessage("");

//     try {
//       await apiFetch(`${API_BASE}/api/users/me`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(profile),
//       });
//       setMessage("Profile updated ✔️");
//     } catch {
//       setMessage("Failed to save ❌");
//     } finally {
//       setSaving(false);
//     }
//   }

//   function logout() {
//     clearToken();
//     navigate("/login");
//   }

//   if (loading) return <div className="profile-loading">Loading profile...</div>;

//   return (
//     <div className="profile-page-container">

//       {/* NAV */}
//       <div className="profile-top-nav">
//         <video autoPlay loop muted playsInline src="/logo.mp4" />
//         <div className="profile-nav-buttons">
//           <button onClick={() => navigate("/AfterLogin")}>Dashboard</button>
//           <button onClick={() => navigate("/offer-ride")}>Offer Ride</button>
//           <button onClick={() => navigate("/find-ride")}>Find Ride</button>
//           <button onClick={logout}>Logout</button>
//         </div>
//       </div>

//       <main className="profile-details-wrapper">
//         <h1>Your Profile Details</h1>

//         <form className="profile-form" onSubmit={saveProfile}>
//           <label>
//             Name
//             <input
//               name="userName"
//               value={profile.userName}
//               onChange={handleChange}
//             />
//           </label>

//           <label>
//             Email
//             <input value={profile.email} disabled />
//           </label>

//           <label>
//             Phone
//             <input
//               name="phoneNumber"
//               value={profile.phoneNumber}
//               onChange={handleChange}
//             />
//           </label>

//           <label>
//             City
//             <input name="city" value={profile.city} onChange={handleChange} />
//           </label>

//           <label>
//             State
//             <input name="state" value={profile.state} onChange={handleChange} />
//           </label>

//           <label>
//             Country
//             <input
//               name="country"
//               value={profile.country}
//               onChange={handleChange}
//             />
//           </label>

//           <label>
//             Gender
//             <select name="gender" value={profile.gender} onChange={handleChange}>
//               <option value="">Select</option>
//               <option value="MALE">Male</option>
//               <option value="FEMALE">Female</option>
//               <option value="OTHER">Other</option>
//             </select>
//           </label>

//           <label>
//             About
//             <textarea
//               name="about"
//               value={profile.about}
//               onChange={handleChange}
//               rows="3"
//             />
//           </label>

//           {message && <p className="profile-msg">{message}</p>}

//           <button type="submit" disabled={saving}>
//             {saving ? "Saving..." : "Save Profile"}
//           </button>
//         </form>
//       </main>
//     </div>
//   );
 }
