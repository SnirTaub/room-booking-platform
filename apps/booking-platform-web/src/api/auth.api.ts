import { apiClient } from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/auth.types";

export async function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/v1/auth/register", payload);
  return response.data;
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/v1/auth/login", payload);
  return response.data;
}