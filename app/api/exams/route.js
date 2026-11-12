import { connectDB } from "@/lib/mongodb";
import Exam from "@/models/Exam";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";
import { currentAcademicYear } from "@/lib/fees";

// Admin: all exams (optionally ?className=). Teacher: only their own class.
export const GET = requireRole(["superadmin", "admin", "teacher"], async (req, _c, session) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter = {};
  if (session.role === "teacher") {
    const me = await User.findById(session.sub).select("classTeacherOf");
    filter.className = me?.classTeacherOf || "__none__";
  } else if (searchParams.get("className")) filter.className = searchParams.get("className");
  return Response.json({ exams: await Exam.find(filter).sort({ createdAt: -1 }).lean() });
});

// body: { name, className, venue, subjects:[{name,date,startTime,endTime,maxMarks}] }
export const POST = requireRole(["superadmin", "admin"], async (req) => {
  const b = await req.json();
  if (!b.name || !b.className || !Array.isArray(b.subjects) || !b.subjects.length) {
    return Response.json({ error: "Exam name, class and at least one subject are required" }, { status: 400 });
  }
  await connectDB();
  const exam = await Exam.create({
    name: b.name, className: b.className, venue: b.venue, academicYear: currentAcademicYear(),
    subjects: b.subjects.filter((s) => s.name).map((s) => ({ ...s, date: s.date || undefined, maxMarks: Number(s.maxMarks) || 100 })),
  });
  return Response.json({ exam }, { status: 201 });
});
