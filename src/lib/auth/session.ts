import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAppSecurity } from "@/lib/db/repositories";

export const SESSION_COOKIE = "daily_os_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

interface SessionPayload {
  version: number;
  issuedAt: number;
  expiresAt: number;
}

function sessionSecret(): string {
  const value = process.env.APP_SESSION_SECRET;
  if (!value) throw new Error("Missing required server environment variable: APP_SESSION_SECRET");
  return value;
}

function encode(value: string): string { return Buffer.from(value, "utf8").toString("base64url"); }
function decode(value: string): string { return Buffer.from(value, "base64url").toString("utf8"); }
function sign(value: string): string { return createHmac("sha256", sessionSecret()).update(value).digest("base64url"); }

function createToken(version: number): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = encode(JSON.stringify({ version, issuedAt: now, expiresAt: now + SESSION_TTL_SECONDS } satisfies SessionPayload));
  return `${payload}.${sign(payload)}`;
}

function readToken(value: string | undefined): SessionPayload | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const parsed = JSON.parse(decode(payload)) as Partial<SessionPayload>;
    if (typeof parsed.version !== "number" || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now() / 1000) return null;
    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

export async function issueSession(version: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createToken(version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export async function hasUnlockedSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = readToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!token) return false;
  try {
    const security = await getAppSecurity();
    return security.setup_completed && Boolean(security.pin_hash) && security.session_version === token.version;
  } catch {
    return false;
  }
}

export async function requireUnlockedSession(): Promise<void> {
  if (!(await hasUnlockedSession())) {
    const error = new Error("UNAUTHORIZED");
    error.name = "UnauthorizedError";
    throw error;
  }
}
