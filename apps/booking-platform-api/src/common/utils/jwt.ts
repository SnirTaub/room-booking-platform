import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";

export interface JwtPayload {
  userId: number;
  email: string;
}

const jwtSecret: Secret = env.jwt.secret;

const signOptions: SignOptions = {
  expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"],
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtSecret, signOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, jwtSecret) as JwtPayload;
}