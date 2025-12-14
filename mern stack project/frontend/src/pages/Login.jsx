import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import api, { setAccessToken } from "../api/axios";
import { useAuth } from "../context/Auth";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Login() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  const [err, setErr] = useState("");
  const [mode, setMode] = useState("login");

  const { isAdmin, loading, isLoggedIn,user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (isLoggedIn) {
      navigate(isAdmin ? "/users" : `/profile/${user.id}`, { replace: true });
    }
  }, [loading, isLoggedIn, isAdmin, navigate]);

  // ✅ Login handler
  const onLogin = async (data) => {
    try {
      setErr("");

      const res = await api.post(`${BASE_URL}/auth/login`, data, {
        headers: { "Content-Type": "application/json" },
      });
      
      window.location.reload();


      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  };
  const onForgot = async (data) => {
    try {
      setErr("");
      const res = await axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: data.email,
      });

      alert(res.data?.message || `Reset link sent to ${data.email}`);
      reset();
      setMode("login");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="auth-wrapper">
      <style>{`
        .auth-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #1d2671, #c33764);
          padding: 20px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
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
        .links a {
          margin-left: 5px;
          color: #c33764;
          text-decoration: none;
        }
        .error {
          color: red;
          text-align: center;
          margin-top: 10px;
        }
      `}</style>

      <div className="auth-card">
        {mode === "login" && (
          <>
            <h2>Login</h2>
            <form onSubmit={handleSubmit(onLogin)}>
              <div className="form-group">
                <label>Email</label>
                <input {...register("email", { required: true })} />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  {...register("password", { required: true })}
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="links">
              <p>
                <span onClick={() => setMode("forgot")}>
                  Forgot Password?
                </span>
              </p>
              <p>
                Don’t have an account?
                <Link to="/register"> Register</Link>
              </p>
            </div>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit(onForgot)}>
              <div className="form-group">
                <label>Email</label>
                <input {...register("email", { required: true })} />
              </div>

              <button disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="links">
              <span onClick={() => setMode("login")}>
                Back to Login
              </span>
            </div>
          </>
        )}

        {err && <p className="error">{err}</p>}
      </div>
    </div>
  );
}
