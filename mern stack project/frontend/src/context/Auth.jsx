import { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const getDecodedUser = (token) => {
    
  if (!token) {
    return { id: null, role: ""};
  }

  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id || decoded._id || null,
      role: decoded.role || "",
    };
  } catch (error) {
    console.error("Invalid token");
    return { id: null, role: "", phoneNumber: "" };
  }
};


export const useAuth = () => {
  const [user, setUser] = useState({
    id: null,
    role: "",
  });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const decodedUser = getDecodedUser(token);
    setUser(decodedUser);
    setLoading(false);
  }, []);
   const logoutUser = () => {
    localStorage.removeItem("accessToken");
    setUser({ id: null, role: "" });
    navigate("/login", { replace: true });
  };


  return {
    user,
    loading,
    isAdmin: user.role === "admin",
    isLoggedIn: !!user.id,
    logoutUser
  };
};

