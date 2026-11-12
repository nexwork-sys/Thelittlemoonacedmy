import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

// --- PIN helpers -------------------------------------------------------------
// Staff log in with a 5-digit PIN only (no email / password). Because the PIN
// alone identifies the person, every PIN must be unique: we store a keyed HMAC
// (pinKey) with a unique index so lookups are instant and duplicates are refused.
export function isValidPin(pin) {
  return /^\d{5}$/.test(String(pin ?? ""));
}
export function pinKeyOf(pin) {
  return crypto.createHmac("sha256", JWT_SECRET || "dev-secret").update(String(pin)).digest("hex");
}

// --- Tiny in-memory rate limiter (per IP) to slow down PIN guessing -------------
const attempts = new Map();
export function rateLimited(req, max = 10, windowMs = 10 * 60 * 1000) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const now = Date.now();
  const rec = (attempts.get(ip) || []).filter((t) => now - t < windowMs);
  rec.push(now);
  attempts.set(ip, rec);
  return rec.length > max;
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  return `school_session=${token}; HttpOnly; Path=/; Max-Age=28800; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

/** Reads the session cookie from a Request and returns the decoded user, or null. */
export function getSessionFromRequest(req) {
  const cookieHeader = req.headers.get ? req.headers.get("cookie") : req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/school_session=([^;]+)/);
  if (!match) return null;
  return verifyToken(decodeURIComponent(match[1]));
}

/** Is this user the Class Teacher for `className`? Admins always pass. */
export function isClassTeacherFor(userDoc, className) {
  if (!userDoc) return false;
  if (["superadmin", "admin"].includes(userDoc.role)) return true;
  return userDoc.classTeacherOf === className;
}

/** Wraps an API handler: caller must be signed in with one of `allowedRoles`
 *  ("superadmin" | "admin" | "teacher" | "student"). */
export function requireRole(allowedRoles, handler) {
  return async (req, ctx) => {
    const session = getSessionFromRequest(req);
    if (!session || !allowedRoles.includes(session.role)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return handler(req, ctx, session);
  };
}
