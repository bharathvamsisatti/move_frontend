// src/jwtUtils.js
// Simple JWT payload parser (base64url -> JSON). Works in browser (uses atob).
export function parseJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let payload = parts[1];
    // base64url -> base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    // pad to multiple of 4
    while (payload.length % 4) payload += '=';
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (err) {
    console.error("parseJwt error:", err);
    return null;
  }
}
