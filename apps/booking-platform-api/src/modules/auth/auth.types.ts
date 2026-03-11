export interface RegisterRequestDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthenticatedUserDto {
  id: number;
  email: string;
  fullName: string;
}

export interface RegisterResponseDto {
  user: AuthenticatedUserDto;
  accessToken: string;
}

export interface LoginResponseDto {
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