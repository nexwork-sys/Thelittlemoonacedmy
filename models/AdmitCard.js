import mongoose from "mongoose";

// One admit card per selected student. Admin picks the students, exam name,
// date and description; it then appears in each student's ERP for download.
const AdmitCardSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    className: String,
    examName: { type: String, required: true, trim: true },
    date: { type: Date },
    time: String,
    venue: String,
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
AdmitCardSchema.index({ student: 1, createdAt: -1 });
export default mongoose.models.AdmitCard || mongoose.model("AdmitCard", AdmitCardSchema);
