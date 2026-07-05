import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "bb_session";
const SECRET = process.env.JWT_SECRET;

export function createSessionCookie(user) {
  const token = jwt.sign(
    { userId: user.id, phone: user.phone, role: user.role },
    SECRET,
    { expiresIn: "30d" }
  );
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

// Reads and verifies the session cookie. Returns null if missing/invalid.
export function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
