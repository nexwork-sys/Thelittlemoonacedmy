import { connectDB } from "@/lib/mongodb";
import ClassFee from "@/models/ClassFee";
import { requireRole } from "@/lib/auth";

export const GET = requireRole(["superadmin", "admin", "teacher"], async () => {
  await connectDB();
  return Response.json({ fees: await ClassFee.find().lean() });
});

// body: { fees: [{ className, monthlyFee }] }
export const PUT = requireRole(["superadmin", "admin"], async (req) => {
  const { fees } = await req.json();
  await connectDB();
  for (const f of fees || []) {
    await ClassFee.findOneAndUpdate({ className: f.className }, { monthlyFee: Math.max(Number(f.monthlyFee) || 0, 0) }, { upsert: true });
  }
  return Response.json({ ok: true });
});
