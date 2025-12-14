import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ResetPassword() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const onReset = async (data) => {
    try {
      setLoading(true);
      setErr("");
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) {
        setErr("Invalid or missing token");
        return;
      }

      const res = await axios.post(`${BASE_URL}/auth/reset-password`, {
        token,
        password: data.password,
      });

      alert(res.data.message || "Password reset successful");
      reset();
      navigate("/login");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1d2671, #c33764)",
        padding: 20,
      }}
    >
      <style>{`
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: #fff;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          animation: slideUp 0.5s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }
        .form-group {
          margin-bottom: 16px;
        }
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 2px solid #ddd;
          font-size: 15px;
          transition: 0.25s;
        }
        input:focus {
          border-color: #c33764;
          box-shadow: 0 0 6px rgba(195,55,100,0.3);
          outline: none;
        }
        button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #c33764;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          transition: 0.25s;
        }
        button:hover {
          background: #a52a52;
          transform: scale(1.02);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .links {
          margin-top: 14px;
          text-align: center;
        }
        .links span {
          color: #c33764;
          cursor: pointer;
          font-weight: 500;
        }
        .error {
          color: red;
          text-align: center;
          margin-top: 10px;
        }
      `}</style>

      <div className="auth-card">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit(onReset)}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              {...register("password", { required: true })}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {err && <p className="error">{err}</p>}

        <div className="links">
          <span onClick={() => navigate("/login")}>Back to Login</span>
        </div>
      </div>
    </div>
  );
}
