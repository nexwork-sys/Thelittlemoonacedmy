import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import FeePayment from "@/models/FeePayment";
import { requireRole } from "@/lib/auth";
import { makeReceiptNo } from "@/lib/fees";

// Student submits a fee payment. It stays "pending" until an Admin approves it.
//   cash: { months, amount, mode:"cash", receivedBy:"<teacher name>" }
//   upi : { months, amount, mode:"upi", upiRef? }
export const POST = requireRole(["student"], async (req, _c, session) => {
  try {
    const { months, amount, mode, receivedBy, upiRef } = await req.json();
    const amt = Number(amount);
    if (!Array.isArray(months) || !months.length) return Response.json({ error: "Select at least one month" }, { status: 400 });
    if (!amt || amt <= 0) return Response.json({ error: "Enter a valid amount" }, { status: 400 });
    if (!["cash", "upi"].includes(mode)) return Response.json({ error: "Choose Cash or UPI" }, { status: 400 });
    if (mode === "cash" && !String(receivedBy || "").trim()) {
      return Response.json({ error: "Enter the name of the teacher you gave the cash to" }, { status: 400 });
    }
    await connectDB();
    const s = await Student.findById(session.sub);
    if (!s) return Response.json({ error: "Student not found" }, { status: 404 });

    let payment;
    for (let i = 0; i < 5 && !payment; i++) {
      try {
        payment = await FeePayment.create({
          student: s._id, studentId: s.studentId, studentName: s.name, className: s.className, rollNumber: s.rollNumber,
          receiptNo: makeReceiptNo(), months, amount: amt, mode,
          receivedBy: mode === "cash" ? String(receivedBy).trim() : undefined,
          upiRef: mode === "upi" ? upiRef : undefined,
        });
      } catch (e) { if (e.code !== 11000) throw e; }
    }
    return Response.json({ payment }, { status: 201 });
  } catch (err) {
    console.error("[student/pay]", err);
    return Response.json({ error: "Could not submit payment" }, { status: 500 });
  }
});
