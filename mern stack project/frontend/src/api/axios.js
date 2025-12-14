import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

export function setAccessToken(token) {
  localStorage.setItem("accessToken", token);
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function setRefreshToken(token) {
  localStorage.setItem("refreshToken", token);
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalReq = error.config;

    if (error.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;

      try {
        const refreshToken = getRefreshToken();
        const r = await axios.post(`${BASE_URL}/auth/refresh`, {
           refreshToken: getRefreshToken(),
        });

        const newToken = r.data.accessToken;

        if (newToken) {
          setAccessToken(newToken);
          originalReq.headers["Authorization"] = `Bearer ${newToken}`;
          return api(originalReq);
        }
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
