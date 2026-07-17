import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const MIN_PASSWORD_LENGTH = 8;
const SCRYPT_KEY_LENGTH = 64;

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const storedKey = Buffer.from(key, "hex");

  return derivedKey.length === storedKey.length && timingSafeEqual(derivedKey, storedKey);
}
