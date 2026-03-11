import { apiClient } from "./client";
import type { LoginRequestDto, LoginResponseDto, RegisterRequestDto, RegisterResponseDto } from "../types/auth.types";

export async function registerUser(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
  const response = await apiClient.post<RegisterResponseDto>("/v1/auth/register", payload);
  return response.data;
}

export async function loginUser(payload: LoginRequestDto): Promise<LoginResponseDto> {
  const response = await apiClient.post<LoginResponseDto>("/v1/auth/login", payload);
  return response.data;
}