import { connectDB } from "@/lib/mongodb";
import FeePayment from "@/models/FeePayment";
import { requireRole } from "@/lib/auth";

// Admin approves / rejects a submitted payment. Only "approved" counts as paid.
export const PATCH = requireRole(["superadmin", "admin"], async (req, ctx, session) => {
  const { status, adminNote } = await req.json();
  if (!["approved", "rejected", "pending"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }
  await connectDB();
  const p = await FeePayment.findByIdAndUpdate(
    ctx.params.id,
    { status, adminNote, decidedAt: new Date(), decidedBy: session.sub },
    { new: true }
  );
  if (!p) return Response.json({ error: "Payment not found" }, { status: 404 });
  return Response.json({ payment: p });
});
