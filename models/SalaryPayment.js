import mongoose from "mongoose";

// One salary payment made by Admin to a teacher. Once saved it counts as "paid"
// and the teacher can download the salary slip (PDF) from their dashboard.
const SalaryPaymentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teacherId: String, // e.g. T-0007
    teacherName: String,
    month: { type: String, required: true }, // "2026-11"
    amount: { type: Number, required: true, min: 1 },
    mode: { type: String, enum: ["cash", "upi", "bank"], default: "cash" },
    note: String,
    slipNo: { type: String, required: true, unique: true }, // e.g. SAL-261119-4821
    status: { type: String, enum: ["paid"], default: "paid" },
    paidAt: { type: Date, default: Date.now },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paidByName: String,
  },
  { timestamps: true }
);
SalaryPaymentSchema.index({ teacher: 1, month: 1 });

export default mongoose.models.SalaryPayment || mongoose.model("SalaryPayment", SalaryPaymentSchema);
