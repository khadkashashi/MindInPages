import api from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export const login = (data: LoginPayload) =>
  api.post<TokenResponse>("/auth/login/", data);

export const register = (data: RegisterPayload) =>
  api.post("/auth/register/", data);

export const getMe = () => api.get("/auth/me/");