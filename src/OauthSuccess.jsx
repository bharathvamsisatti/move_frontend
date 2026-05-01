// src/OauthSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveToken } from "./authClient";

export default function OauthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
  const raw = params.get("token");

  if (!raw) {
    navigate("/login", { replace: true });
    return;
  }

  // ✅ decode if JSON
  let token = raw;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    token = parsed.token || raw;
  } catch {}

  saveToken(token);
  navigate("/", { replace: true });
}, [params, navigate]);
}