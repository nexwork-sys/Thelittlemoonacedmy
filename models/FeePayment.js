import mongoose from "mongoose";

// One fee submission by a student. Nothing counts as "paid" until an Admin
// approves it (status -> "approved"). Cash/UPI both start as "pending".
const FeePaymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    receiptNo: { type: String, required: true, unique: true }, // e.g. LMA-260412-4821
    studentId: String,
    studentName: String,
    className: String,
    rollNumber: Number,
    months: [{ type: String }], // "2026-04" ...
    amount: { type: Number, required: true, min: 1 },
    mode: { type: String, enum: ["cash", "upi"], required: true },
    receivedBy: { type: String }, // teacher name (cash only)
    upiRef: { type: String }, // UTR / transaction id (UPI, optional)
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminNote: String,
    decidedAt: Date,
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
FeePaymentSchema.index({ student: 1, status: 1 });

export default mongoose.models.FeePayment || mongoose.model("FeePayment", FeePaymentSchema);
