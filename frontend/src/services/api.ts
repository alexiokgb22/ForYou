import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  withCredentials: true,
});

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const collectionService = {
  create: (data: { title: string; readingMode: string; unlockDate?: string }) =>
    api.post("/collections", data),
  getMine: () => api.get("/collections/mine"),
  getOne: (token: string) => api.get(`/collections/${token}`),
  delete: (id: number) => api.delete(`/collections/${id}`),
};

export default api;
