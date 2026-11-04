import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { requireRole } from "@/lib/auth";

// Admin approves (or withdraws) download access for a student with pending fees.
export const POST = requireRole(["superadmin", "admin"], async (req) => {
  const { studentId, unlock } = await req.json();
  await connectDB();
  await Student.findByIdAndUpdate(studentId, { docUnlock: !!unlock, ...(unlock ? { docRequestAt: null } : {}) });
  return Response.json({ ok: true });
});
