import { connectDB } from "@/lib/mongodb";
import SalaryPayment from "@/models/SalaryPayment";
import { requireRole } from "@/lib/auth";

// DELETE /api/salary/:id  (admin) — undo a wrongly entered salary payment.
export const DELETE = requireRole(["superadmin", "admin"], async (_req, ctx) => {
  await connectDB();
  const p = await SalaryPayment.findByIdAndDelete(ctx.params.id);
  if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ deleted: true });
});
