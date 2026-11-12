import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { requireRole } from "@/lib/auth";

// Student asks the Admin to unlock downloads while fees are pending.
export const POST = requireRole(["student"], async (_req, _c, session) => {
  await connectDB();
  await Student.findByIdAndUpdate(session.sub, { docRequestAt: new Date() });
  return Response.json({ ok: true });
});
