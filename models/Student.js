import mongoose from "mongoose";
import { CLASS_OPTIONS } from "./Inquiry";

const StudentSchema = new mongoose.Schema(
  {
    // Login ID for the Student ERP (auto-generated when a teacher adds the student).
    studentId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    admissionNumber: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    fatherName: { type: String },
    motherName: { type: String },
    className: { type: String, required: true, enum: CLASS_OPTIONS },
    section: { type: String, default: "A" },
    rollNumber: { type: Number },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    photoUrl: { type: String },
    photoPublicId: { type: String },
    guardianMobile: { type: String },
    address: { type: String },
    academicYear: { type: String, required: true }, // e.g. "2026-27"
    monthlyFee: { type: Number, default: 0 }, // 0 = use the class default
    admissionDate: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    lastReminderAt: { type: Date },
    // Admin approval to download admit card / result even while fees are pending
    docUnlock: { type: Boolean, default: false },
    docRequestAt: { type: Date },
  },
  { timestamps: true }
);

StudentSchema.index({ className: 1, section: 1, rollNumber: 1 });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
