import React,{ useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");

  useEffect(() => {
    if (token) {
      axios.get(`${BASE_URL}/auth/verify-email?token=${token}`)
        .then(() => alert("Email verified successfully"))
        .catch(() => alert("Verification failed"));
    }
  }, [token]);

   return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2> Email Verified Successfully</h2>
      <p>You can now login</p>
    </div>
  );
}
