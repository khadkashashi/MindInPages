import axios from "axios";

const API = "http://127.0.0.1:8000/api/v1";
const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: any = error.config;
    const refresh = localStorage.getItem("refresh_token");
    const isAuthForm = ["/auth/login/", "/auth/register/"].includes(original?.url);
    if (error.response?.status !== 401 || original._retry || !refresh || isAuthForm) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      refreshing ??= axios
        .post(`${API}/auth/refresh/`, { refresh })
        .then((r) => r.data.access as string)
        .finally(() => {
          refreshing = null;
        });
      const access = await refreshing;
      localStorage.setItem("access_token", access);
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }
  }
);

export default api;