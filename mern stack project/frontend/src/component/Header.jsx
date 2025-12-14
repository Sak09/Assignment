import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Auth";

const Header = () => {
  const { isLoggedIn, logoutUser, loading } = useAuth();

  if (loading) return null;

  return (
    <header style={styles.header}>
      <h2>My App</h2>

      <nav style={styles.nav}>
        {isLoggedIn && (
          <>
          

            <button onClick={logoutUser} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        )}

        {!isLoggedIn && <Link to="/login">Login</Link>}
      </nav>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#222",
    color: "#fff",
  },
  nav: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  logoutBtn: {
    padding: "6px 12px",
    cursor: "pointer",
  },
};

export default Header;
