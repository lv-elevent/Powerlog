import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await derive(pin, salt, KEY_LENGTH, { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION });
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString("base64url")}$${derivedKey.toString("base64url")}`;
}

export async function verifyPin(pin: string, encoded: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelization, saltValue, hashValue] = encoded.split("$");
  if (algorithm !== "scrypt" || !cost || !blockSize || !parallelization || !saltValue || !hashValue) return false;
  const expected = Buffer.from(hashValue, "base64url");
  const derivedKey = await derive(pin, Buffer.from(saltValue, "base64url"), expected.length, { N: Number(cost), r: Number(blockSize), p: Number(parallelization) });
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey);
}

function derive(password: string, salt: Buffer, keyLength: number, options: { N: number; r: number; p: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => scryptCallback(password, salt, keyLength, options, (error, derivedKey) => error ? reject(error) : resolve(derivedKey as Buffer)));
}
