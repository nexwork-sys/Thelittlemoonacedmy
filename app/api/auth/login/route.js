import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";
import { signToken, sessionCookie, isValidPin, pinKeyOf, rateLimited } from "@/lib/auth";

// POST /api/auth/login
//   Staff (admin + teacher):  { pin: "12345" }          -> role comes from the account
//   Student:                  { studentId: "LMA26-0001" }
// No email / password anywhere. Default admin PIN is 12345 (seeded).
export async function POST(req) {
  try {
    if (rateLimited(req)) {
      return Response.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
    }
    const { pin, studentId } = await req.json();
    await connectDB();

    let token, user;

    if (studentId) {
      const student = await Student.findOne({ studentId: String(studentId).trim().toUpperCase(), active: true });
      if (!student) return Response.json({ error: "Invalid Student ID" }, { status: 401 });
      token = signToken({ sub: student._id.toString(), role: "student", name: student.name, className: student.className });
      user = { id: student._id, name: student.name, role: "student" };
    } else if (pin) {
      if (!isValidPin(pin)) return Response.json({ error: "PIN must be exactly 5 digits" }, { status: 400 });
      let matched = await User.findOne({ pinKey: pinKeyOf(pin), active: true, deletedAt: null });

      // First-run safety net: no staff at all yet -> 12345 creates the Super Admin.
      if (!matched && String(pin) === "12345" && (await User.estimatedDocumentCount()) === 0) {
        matched = await User.create({
          name: "Super Admin", role: "superadmin", teacherId: "ADM-0001",
          pinKey: pinKeyOf("12345"), pinHash: await bcrypt.hash("12345", 10),
        });
      }
      if (!matched) return Response.json({ error: "Invalid PIN" }, { status: 401 });

      matched.lastLoginAt = new Date();
      await matched.save();
      token = signToken({
        sub: matched._id.toString(), role: matched.role, name: matched.name,
        classTeacherOf: matched.classTeacherOf || null,
      });
      user = { id: matched._id, name: matched.name, role: matched.role };
    } else {
      return Response.json({ error: "Enter your PIN or Student ID" }, { status: 400 });
    }

    const res = Response.json({ user });
    res.headers.set("Set-Cookie", sessionCookie(token));
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    if (err?.name === "MongooseServerSelectionError" || err?.name === "MongoServerSelectionError" || /ECONNREFUSED|ENOTFOUND|selection/i.test(err?.message || "")) {
      return Response.json({ error: "Database se connect nahi ho paa raha. Admin ko batayein (MongoDB Atlas Network Access check karein)." }, { status: 503 });
    }
    return Response.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
