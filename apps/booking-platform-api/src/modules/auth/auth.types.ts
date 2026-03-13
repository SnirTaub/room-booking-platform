export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  fullName: string;
}

export interface RegisterResponse {
  user: AuthenticatedUser;
  accessToken: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}