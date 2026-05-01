// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import HomePage from "./Homepage";
import OfferRide from "./offerride";
import ThankYouPage from "./ThankYouPage";
import FindRide from "./FindRide";
import Login from "./Login";
import Register from "./Register";
import RequireAuth from "./RequireAuth";
import OauthSuccess from "./OauthSuccess"; // ⭐ new
import AfterLogin from "./AfterLogin"; // ⭐ new
import RideDetails from "./RideDetails";
import ProfilePage from "./ProfilePage";
import MyBookings from "./MyBookings";
import MyOfferedRides from "./MyOfferedRides";
import Help from "./help";
import MyProfile from "./MyProfile";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import EditProfile from "./EditProfile";
import BookingSuccess from "./BookingSuccess";




const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined");
}



export default function App() {
  return (
    <BrowserRouter>
      {/* mode="wait" = replacement for exitBeforeEnter */}
      <AnimatePresence mode="wait">
        <Routes>
          {/* 🌐 Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help" element={<Help />} />
          {/* Google OAuth redirects here: /oauth-success?token=... */}
          <Route path="/oauth-success" element={<OauthSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />


          {/* 🔒 Protected routes (need JWT) */}
          <Route element={<RequireAuth />}>
            <Route path="/offer-ride" element={<OfferRide />} />
            <Route path="/find-ride" element={<FindRide />} />
            <Route path="/thankyou" element={<ThankYouPage />} />
            <Route path="/AfterLogin" element={<AfterLogin />} />  {/* 🔹 new */}
            <Route path="/rides/:id" element={<RideDetails />} />
            <Route path="/ProfilePage" element={<Navigate to="/profile" replace />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/my-rides" element={<MyOfferedRides />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/ride/:id" element={<RideDetails />} />
            <Route path="/BookingSuccess" element={<BookingSuccess />} />




          </Route>

          {/* (you can add a 404 route later if you want) */}
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
