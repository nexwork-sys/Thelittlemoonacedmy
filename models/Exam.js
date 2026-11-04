import mongoose from "mongoose";

// Exam = timetable (per class) + admit-card switch + published results.
const ExamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "Half Yearly 2026"
    className: { type: String, required: true },
    academicYear: { type: String },
    subjects: [
      {
        name: { type: String, required: true },
        date: { type: Date },
        startTime: String, // "09:00"
        endTime: String,
        maxMarks: { type: Number, default: 100 },
        _id: false,
      },
    ],
    venue: { type: String },
    admitCardOpen: { type: Boolean, default: false },
    resultPublished: { type: Boolean, default: false },
    // marks[studentObjectId] = { Hindi: 78, ... } stored as array for easy queries
    results: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        marks: [{ subject: String, obtained: Number, _id: false }],
        _id: false,
      },
    ],
  },
  { timestamps: true }
);
ExamSchema.index({ className: 1, createdAt: -1 });

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
