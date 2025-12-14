import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Header from "./component/Header.jsx";
const Register = React.lazy(() => import("./pages/Register.jsx"));
const Login = React.lazy(() => import("./pages/Login.jsx"));
const Users = React.lazy(() => import("./pages/Users.jsx"));
const Profile = React.lazy(() => import("./pages/Profile.jsx"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
       <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login/>} />
          <Route
        path="/users"
        element={
            <Users />
        }
      />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
           <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
