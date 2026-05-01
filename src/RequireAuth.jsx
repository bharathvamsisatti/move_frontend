// src/RequireAuth.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isLoggedIn } from "./authClient";

export default function RequireAuth() {
  const location = useLocation();
  const loggedIn = isLoggedIn();

  if (!loggedIn) {
    // ⛔ not logged in → go to /login
    // state.from = where they were trying to go
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ user has token → allow child route
  return <Outlet />;
}
