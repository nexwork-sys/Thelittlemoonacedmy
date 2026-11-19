import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import SalaryPayment from "@/models/SalaryPayment";
import { requireRole } from "@/lib/auth";

function makeSlipNo() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `SAL-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// GET  /api/salary[?teacher=<id>]  admin: all payments (optionally one teacher)
//                                  teacher: only their own payments
export const GET = requireRole(["superadmin", "admin", "teacher"], async (req, _c, session) => {
  await connectDB();
  const filter = {};
  if (session.role === "teacher") filter.teacher = session.sub;
  else {
    const t = new URL(req.url).searchParams.get("teacher");
    if (t) filter.teacher = t;
  }
  const payments = await SalaryPayment.find(filter).sort({ month: -1, paidAt: -1 }).limit(500).lean();
  return Response.json({ payments });
});

// POST /api/salary  (admin) { teacher, month:"YYYY-MM", amount, mode?, note?, force? }
// Marks the salary as paid and creates the slip. Refuses a second payment for the
// same teacher + month unless force:true (for bonus / part-payments).
export const POST = requireRole(["superadmin", "admin"], async (req, _c, session) => {
  try {
    const { teacher, month, amount, mode, note, force } = await req.json();
    const amt = Number(amount);
    if (!teacher) return Response.json({ error: "Teacher select karein" }, { status: 400 });
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""))) return Response.json({ error: "Month select karein" }, { status: 400 });
    if (!amt || amt <= 0) return Response.json({ error: "Valid amount daalein" }, { status: 400 });
    const payMode = ["cash", "upi", "bank"].includes(mode) ? mode : "cash";

    await connectDB();
    const t = await User.findOne({ _id: teacher, role: "teacher", deletedAt: null });
    if (!t) return Response.json({ error: "Teacher nahi mila" }, { status: 404 });

    if (!force) {
      const exists = await SalaryPayment.findOne({ teacher: t._id, month });
      if (exists) {
        return Response.json({ error: `${t.name} ki ${month} ki salary pehle se paid hai (₹${exists.amount}).`, duplicate: true }, { status: 409 });
      }
    }

    let payment;
    for (let i = 0; i < 5 && !payment; i++) {
      try {
        payment = await SalaryPayment.create({
          teacher: t._id, teacherId: t.teacherId, teacherName: t.name, month, amount: amt,
          mode: payMode, note: String(note || "").trim() || undefined, slipNo: makeSlipNo(),
          paidBy: session.sub, paidByName: session.name,
        });
      } catch (e) { if (e.code !== 11000) throw e; }
    }
    return Response.json({ payment }, { status: 201 });
  } catch (err) {
    console.error("[salary:POST]", err);
    return Response.json({ error: "Salary save nahi ho payi" }, { status: 500 });
  }
});
