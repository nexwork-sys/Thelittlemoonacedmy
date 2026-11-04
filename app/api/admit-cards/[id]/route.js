import { connectDB } from "@/lib/mongodb";
import AdmitCard from "@/models/AdmitCard";
import { requireRole } from "@/lib/auth";

export const DELETE = requireRole(["superadmin", "admin"], async (_req, ctx) => {
  await connectDB();
  await AdmitCard.findByIdAndDelete(ctx.params.id);
  return Response.json({ ok: true });
});
