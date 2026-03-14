import { stub } from "sinon";
import type { AuthProvider } from "../../src/modules/auth/auth.provider";
import type { UserRow } from "../../src/modules/auth/auth.types";

export const registerPayload = {
  email: "user@example.com",
  password: "password123",
  fullName: "Snir",
};

export const loginPayload = {
  email: "user@example.com",
  password: "secret",
};

export const registerResponse = {
  user: { id: 1, email: registerPayload.email, fullName: registerPayload.fullName },
  accessToken: "token-123",
};

export const loginResponse = {
  accessToken: "jwt-token",
};

export function createUserRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: 1,
    email: "user@example.com",
    password_hash: "hash",
    full_name: "Test User",
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

export function createMockAuthProvider(partial: Partial<{
  findUserByEmail: ReturnType<typeof stub>;
  insertUser: ReturnType<typeof stub>;
}> = {}): AuthProvider {
  return {
    findUserByEmail: stub().resolves(null),
    insertUser: stub(),
    ...partial,
  } as unknown as AuthProvider;
}