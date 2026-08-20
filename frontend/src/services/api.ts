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
  getLetters: (token: string) => api.get(`/collections/${token}/letters`),
  openLetter: (token: string, id: number) =>
    api.patch(`/collections/${token}/letters/${id}/open`),
};

export const writeService = {
  getCollection: (token: string) => api.get(`/write/${token}`),
  submitLetter: (token: string, data: {
    senderName: string;
    senderEmail?: string;
    content: string;
    theme: string;
    designConfig?: object;
  }) => api.post(`/write/${token}/letters`, data),
};
