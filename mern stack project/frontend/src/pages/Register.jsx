import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link } from "react-router-dom";
import api from "../api/axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setValue("profileImage", file, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage("");

      const form = new FormData();
      form.append("firstName", data.firstName);
      form.append("lastName", data.lastName || "");
      form.append("email", data.email);
      form.append("password", data.password);

      if (data.profileImage) {
        form.append("profileImage", data.profileImage);
      }
      console.log(data.profileImage);

      const res = await api.post(`${BASE_URL}/auth/register`, form);
      for (let pair of form.entries()) {
        console.log(pair[0], pair[1]);
      }

      setMessage(res.data.message || "Registered successfully");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <style>{`
        .register-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          // background: linear-gradient(135deg, #6a11cb, #2575fc);
          padding: 20px;
        }
        .register-card {
          width: 100%;
          max-width: 450px;
          background: white;
          padding: 28px;
          border-radius: 18px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          animation: fadeIn 0.6s ease;
        }
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(10px);}
          to   {opacity: 1; transform: translateY(0);}
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
          font-size: 26px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
        }
        input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e2e2e2;
          border-radius: 10px;
          font-size: 15px;
          transition: 0.25s ease;
        }
        input:focus {
          border-color: #6a11cb;
          box-shadow: 0 0 5px rgba(106,17,203,0.3);
        }
        .error {
          font-size: 13px;
          color: #d9534f;
          margin-top: 3px;
          display: block;
        }
        .preview-img {
          width: 140px;
          height: 140px;
          object-fit: cover;
          border-radius: 10px;
          margin-top: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          animation: fadeImage 0.4s ease;
        }
        @keyframes fadeImage {
          from {opacity: 0;}
          to   {opacity: 1;}
        }
        button {
          width: 100%;
          padding: 12px;
          background: #6a11cb;
          color: white;
          font-size: 17px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.2s ease;
        }
        button:hover {
          background: #5408a7;
          transform: scale(1.02);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .message {
          margin-top: 12px;
          text-align: center;
          font-weight: 500;
        }
      `}</style>

      <div className="register-card">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>First Name</label>
            <input
              {...register("firstName", { required: true, minLength: 2 })}
            />
            {errors.firstName && (
              <span className="error">First name required</span>
            )}
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input {...register("lastName")} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              {...register("email", {
                required: true,
                pattern: /\S+@\S+\.\S+/,
              })}
            />
            {errors.email && (
              <span className="error">Valid email required</span>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register("password", { required: true, minLength: 6 })}
            />
            {errors.password && <span className="error">Min 6 characters</span>}
          </div>

          <div className="form-group">
            <label>Profile Image</label>
            <input type="file" accept="image/*" onChange={onFileChange} />

            {preview && (
              <img src={preview} alt="preview" className="preview-img" />
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/login" className="login-btn">
              Login
            </Link>
          </div>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
