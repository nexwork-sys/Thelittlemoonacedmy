import { connectDB } from "@/lib/mongodb";
import FeePayment from "@/models/FeePayment";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";

// ?status=pending|approved|rejected  &receipt=LMA-...   (admin: all, teacher: own class)
export const GET = requireRole(["superadmin", "admin", "teacher"], async (req, _c, session) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter = {};
  const status = searchParams.get("status");
  const receipt = searchParams.get("receipt");
  if (status) filter.status = status;
  if (receipt) filter.receiptNo = receipt.trim().toUpperCase();
  if (session.role === "teacher") {
    const me = await User.findById(session.sub).select("classTeacherOf");
    filter.className = me?.classTeacherOf || "__none__";
  }
  const payments = await FeePayment.find(filter).sort({ createdAt: -1 }).limit(300).lean();
  return Response.json({ payments });
});
