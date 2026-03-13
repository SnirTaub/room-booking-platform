export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  accessToken: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface AuthUser {
  userId: number;
  email: string;
}