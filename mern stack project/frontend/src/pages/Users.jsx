import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


const BASE_URL = import.meta.env.VITE_BASE_URL;
const PAGE_SIZE = 10;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
    const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
     if (!token) {
    navigate("/login", { replace: true });
    return;
  }
    fetchUsers();
  }, [page, q, token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `${BASE_URL}/auth/users?page=${page}&limit=${PAGE_SIZE}&q=${encodeURIComponent(q)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err?.response?.data?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="users-wrapper">
      <h2>Users</h2>
      <input
        className="search"
        placeholder="Search by email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-container">
        {loading ? (
          <p className="status">Loading...</p>
        ) : users.length === 0 ? (
          <p className="status">No users found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                 <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="user-cell">
                    <img
                      src={
                        u.profileImage
                          ? `http://localhost:5000${u.profileImage}`
                          : `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}`
                      }
                      alt="avatar"
                    />
                    <span>
                      {u.firstName} {u.lastName}
                    </span>
                  </td>
                  <td>{u.email}</td>
                   <td>
                    <button onClick={() => navigate(`/profile/${u.id}`)}>
                      View
                    </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      <style>{`
        .users-wrapper {
          max-width: 900px;
          margin: auto;
          padding: 16px;
        }

        .search {
          width: 100%;
          padding: 10px;
          margin: 12px 0;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .table-container {
          overflow-x: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #f8f8f8;
          font-weight: 600;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-cell img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
        }

        button {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background: #c33764;
          color: #fff;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status {
          padding: 20px;
          text-align: center;
          color: #666;
        }

        /* 📱 Mobile */
        @media (max-width: 600px) {
          table thead {
            display: none;
          }

          table tr {
            display: block;
            padding: 12px;
          }

          table td {
            display: flex;
            justify-content: space-between;
            border: none;
            padding: 6px 0;
          }
        }
      `}</style>
    </div>
  );
}
