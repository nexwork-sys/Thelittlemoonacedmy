import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { requireRole, isValidPin, pinKeyOf } from "@/lib/auth";

const SAFE = "-pinHash -pinKey -faceDescriptor";

export const GET = requireRole(["superadmin", "admin"], async (req) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("includeDeleted") === "true" ? {} : { deletedAt: null };
  const staff = await User.find(filter).select(SAFE).sort({ createdAt: -1 });
  return Response.json({ staff });
});

async function nextTeacherId() {
  const last = await User.findOne({ teacherId: /^T-/ }).sort({ teacherId: -1 }).select("teacherId");
  const n = (parseInt(last?.teacherId?.match(/(\d+)$/)?.[1] || "0", 10) || 0) + 1;
  return `T-${String(n).padStart(4, "0")}`;
}

// Admin adds a teacher: name + 5-digit PIN + optional class-teacher class + face + phone.
// (No email/password, no subjects.)
export const POST = requireRole(["superadmin", "admin"], async (req) => {
  try {
    const { name, pin, classTeacherOf, phone, teacherId, faceCaptured, faceImageUrl, faceDescriptor } = await req.json();
    if (!name || !pin) return Response.json({ error: "Name and a 5-digit PIN are required" }, { status: 400 });
    if (!isValidPin(pin)) return Response.json({ error: "PIN must be exactly 5 digits" }, { status: 400 });

    await connectDB();
    if (await User.findOne({ pinKey: pinKeyOf(pin) })) {
      return Response.json({ error: "This PIN is already used by someone else. Choose another." }, { status: 409 });
    }
    const finalId = teacherId?.trim() || (await nextTeacherId());
    if (await User.findOne({ teacherId: finalId })) {
      return Response.json({ error: "That teacher ID is already in use" }, { status: 409 });
    }
    const user = await User.create({
      name, role: "teacher", phone, teacherId: finalId,
      pinKey: pinKeyOf(pin), pinHash: await bcrypt.hash(String(pin), 10),
      classTeacherOf: classTeacherOf || null,
      assignedClasses: classTeacherOf ? [classTeacherOf] : [],
      faceCaptured: !!faceCaptured,
      faceImageUrl: faceImageUrl || undefined,
      faceDescriptor: Array.isArray(faceDescriptor) && faceDescriptor.length ? faceDescriptor : undefined,
    });
    const { pinHash, pinKey, faceDescriptor: _fd, ...safe } = user.toObject();
    return Response.json({ user: safe }, { status: 201 });
  } catch (err) {
    console.error("[staff:POST]", err);
    return Response.json({ error: "Could not create teacher" }, { status: 500 });
  }
});
