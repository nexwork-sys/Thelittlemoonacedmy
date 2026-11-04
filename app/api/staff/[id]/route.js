import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { requireRole, isValidPin, pinKeyOf } from "@/lib/auth";

// PATCH /api/staff/:id — edit a teacher/admin record
export const PATCH = requireRole(["superadmin", "admin"], async (req, ctx) => {
  try {
    const { id } = ctx.params;
    const body = await req.json();
    await connectDB();

    const update = {};
    for (const key of ["name", "phone", "classTeacherOf", "faceCaptured", "faceImageUrl", "faceDescriptor", "active"]) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (body.pin) {
      if (!isValidPin(body.pin)) return Response.json({ error: "PIN must be exactly 5 digits" }, { status: 400 });
      const clash = await User.findOne({ pinKey: pinKeyOf(body.pin), _id: { $ne: id } });
      if (clash) return Response.json({ error: "This PIN is already used by someone else" }, { status: 409 });
      update.pinKey = pinKeyOf(body.pin);
      update.pinHash = await bcrypt.hash(String(body.pin), 10);
    }
    if ("classTeacherOf" in update) update.assignedClasses = update.classTeacherOf ? [update.classTeacherOf] : [];
    if (body.teacherId) update.teacherId = body.teacherId.trim();

    const updated = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
      .select("-pinHash -pinKey -faceDescriptor");

    if (!updated) return Response.json({ error: "Staff record not found" }, { status: 404 });
    return Response.json({ user: updated });
  } catch (err) {
    console.error("[staff/:id PATCH]", err);
    return Response.json({ error: "Could not update account" }, { status: 500 });
  }
});

// DELETE /api/staff/:id?hard=true — soft-delete (default) or hard-delete a record
export const DELETE = requireRole(["superadmin", "admin"], async (req, ctx) => {
  try {
    const { id } = ctx.params;
    const { searchParams } = new URL(req.url);
    const hard = searchParams.get("hard") === "true";
    await connectDB();

    if (hard) {
      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) return Response.json({ error: "Staff record not found" }, { status: 404 });
      return Response.json({ deleted: true, mode: "hard" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { active: false, deletedAt: new Date() } },
      { new: true }
    );
    if (!updated) return Response.json({ error: "Staff record not found" }, { status: 404 });
    return Response.json({ deleted: true, mode: "soft", user: updated });
  } catch (err) {
    console.error("[staff/:id DELETE]", err);
    return Response.json({ error: "Could not delete account" }, { status: 500 });
  }
});
