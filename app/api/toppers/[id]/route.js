import { connectDB } from "@/lib/mongodb";
import Topper from "@/models/Topper";
import { requireRole } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// DELETE /api/toppers/:id — admin, or a Class Teacher removing a topper
// from their own class only, from the "Topper's Corner" grid; cleans up
// the Cloudinary photo (if any).
export const DELETE = requireRole(["superadmin", "admin", "teacher"], async (req, ctx, session) => {
  try {
    const { id } = ctx.params;
    await connectDB();

    const existing = await Topper.findById(id);
    if (!existing) {
      return Response.json({ error: "Topper not found" }, { status: 404 });
    }
    if (session.role === "teacher" && existing.className !== session.classTeacherOf) {
      return Response.json({ error: "You can only manage toppers from your own class" }, { status: 403 });
    }

    const deleted = await Topper.findByIdAndDelete(id);

    if (deleted.photoPublicId) {
      // Best-effort cleanup — a failed Cloudinary delete shouldn't block the
      // topper record itself from being removed.
      try {
        await deleteFromCloudinary(deleted.photoPublicId);
      } catch (err) {
        console.error("[toppers/:id DELETE] cloudinary cleanup failed", err);
      }
    }

    return Response.json({ deleted: true });
  } catch (err) {
    console.error("[toppers/:id DELETE]", err);
    return Response.json({ error: "Could not delete topper" }, { status: 500 });
  }
});
