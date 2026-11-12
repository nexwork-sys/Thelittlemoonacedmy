import { connectDB } from "@/lib/mongodb";
import AdmitCard from "@/models/AdmitCard";
import Student from "@/models/Student";
import { requireRole } from "@/lib/auth";

// GET ?className=  -> generated admit cards (grouped on the client)
export const GET = requireRole(["superadmin", "admin"], async (req) => {
  await connectDB();
  const c = new URL(req.url).searchParams.get("className");
  const cards = await AdmitCard.find(c ? { className: c } : {}).sort({ createdAt: -1 }).limit(500).populate("student", "name studentId rollNumber").lean();
  return Response.json({ cards });
});

// POST { examName, date, time, venue, description, studentIds: [] }
export const POST = requireRole(["superadmin", "admin"], async (req, _c, session) => {
  const b = await req.json();
  if (!b.examName?.trim() || !Array.isArray(b.studentIds) || !b.studentIds.length) {
    return Response.json({ error: "Exam ka naam aur kam se kam ek student chunein" }, { status: 400 });
  }
  await connectDB();
  const students = await Student.find({ _id: { $in: b.studentIds }, active: true }).select("className");
  const docs = students.map((s) => ({
    student: s._id, className: s.className, examName: b.examName.trim(), date: b.date || undefined,
    time: b.time, venue: b.venue, description: b.description, createdBy: session.sub,
  }));
  await AdmitCard.insertMany(docs);
  return Response.json({ created: docs.length }, { status: 201 });
});
