import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { requireRole } from "@/lib/auth";

// Marks fee reminders as sent; the student sees the reminder in their ERP.
export const POST = requireRole(["superadmin", "admin"], async (req) => {
  const { ids } = await req.json();
  await connectDB();
  await Student.updateMany({ _id: { $in: ids || [] } }, { lastReminderAt: new Date() });
  return Response.json({ ok: true });
});
