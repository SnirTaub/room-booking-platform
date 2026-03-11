export interface RegisterRequestDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterResponseDto {
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  accessToken: string;
}

export interface LoginResponseDto {
  accessToken: string;
}

export interface AuthUser {
  userId: number;
  email: string;
}