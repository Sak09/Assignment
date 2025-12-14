import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/Auth";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Profile() {
  const { register, handleSubmit, setValue } = useForm();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("accessToken");
  const [preview, setPreview] = useState(null);
  const { isAdmin } = useAuth();
   const { id } = useParams();
    const navigate = useNavigate();


useEffect(() => {
  if (!token) {
    navigate("/login", { replace: true });
    return;
  }

  load();
}, [token, id, navigate]);

  const load = async () => {
    try {
      const res = await api.get(`${BASE_URL}/auth/profile/${id}`,
         {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("User IDf:", res);
      setUser(res.data);
      setValue("firstName", res.data.firstName);
      setValue("lastName", res.data.lastName);
      setValue("role", res.data.role);
      setValue("email", res.data.email);
    } catch (err) {}
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setValue("profileImage", file, { shouldValidate: true });
    }
  };
  const onSubmit = async (data) => {
    try {
      const form = new FormData();
      form.append("firstName", data.firstName);
      form.append("lastName", data.lastName || "");
      if (isAdmin) form.append("role", data.role || "");
     if (data.profileImage) {
    form.append("profileImage", data.profileImage);
     }
   

      const res = await api.put(`${BASE_URL}/auth/profile/${id}`, form, {
        headers: {
           Authorization: `Bearer ${token}` ,
         },
      });
      alert("Updated");
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "auto",
        padding: 20,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        animation: "fadeIn 0.5s ease",
      }}
    >
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        label {
          font-weight: 500;
          display: block;
          margin-bottom: 6px;
        }
        input, select {
          width: 100%;
          padding: 10px 12px;
          margin-bottom: 16px;
          border-radius: 10px;
          border: 2px solid #ddd;
          font-size: 15px;
          transition: 0.25s;
        }
        input:focus, select:focus {
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
        .profile-image {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .profile-image img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ddd;
        }
      `}
      </style>

      <h2 style={{ textAlign: "center", marginBottom: 20 }}>My Profile</h2>
      {user && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label>First Name</label>
            <input {...register("firstName")} />
          </div>
          <div>
            <label>Last Name</label>
            <input {...register("lastName")} />
          </div>
          <div>
            <label>Email</label>
            <input {...register("email")} disabled />
          </div>
          {isAdmin && (
            <div>
              <label>Role</label>
              <select {...register("role")}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <div className="profile-image">
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
            
            <div>
              {preview ? (
                <img src={preview} alt="preview" />
              ) : user.profileImage ? (
                <img
                  src={`http://localhost:5000${user.profileImage}`}
                  alt="profile"
                />
              ) : null}
            </div>
          </div>
          <button type="submit">Save</button>
        </form>
      )}
    </div>
  );
}
