import mongoose from "mongoose";

// Default monthly fee for a class (a student's own monthlyFee overrides it).
const ClassFeeSchema = new mongoose.Schema(
  { className: { type: String, required: true, unique: true }, monthlyFee: { type: Number, default: 0 } },
  { timestamps: true }
);
export default mongoose.models.ClassFee || mongoose.model("ClassFee", ClassFeeSchema);
