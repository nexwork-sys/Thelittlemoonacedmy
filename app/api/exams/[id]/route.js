import { connectDB } from "@/lib/mongodb";
import Exam from "@/models/Exam";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";

// Admin: edit timetable / switch admit cards & results on or off.
export const PATCH = requireRole(["superadmin", "admin"], async (req, ctx) => {
  const b = await req.json();
  const set = {};
  for (const k of ["name", "venue", "subjects", "admitCardOpen", "resultPublished"]) if (k in b) set[k] = b[k];
  await connectDB();
  const exam = await Exam.findByIdAndUpdate(ctx.params.id, { $set: set }, { new: true });
  if (!exam) return Response.json({ error: "Exam not found" }, { status: 404 });
  return Response.json({ exam });
});

export const DELETE = requireRole(["superadmin", "admin"], async (_req, ctx) => {
  await connectDB();
  await Exam.findByIdAndDelete(ctx.params.id);
  return Response.json({ ok: true });
});

// Save marks. body: { results: [{ student, marks: [{ subject, obtained }] }] }
// Admin can enter for any class; a teacher only for their own class.
export const PUT = requireRole(["superadmin", "admin", "teacher"], async (req, ctx, session) => {
  const { results } = await req.json();
  await connectDB();
  const exam = await Exam.findById(ctx.params.id);
  if (!exam) return Response.json({ error: "Exam not found" }, { status: 404 });
  if (session.role === "teacher") {
    const me = await User.findById(session.sub).select("classTeacherOf");
    if (me?.classTeacherOf !== exam.className) return Response.json({ error: "Not your class" }, { status: 403 });
  }
  const max = Object.fromEntries(exam.subjects.map((s) => [s.name, s.maxMarks]));
  const map = new Map((exam.results || []).map((r) => [String(r.student), r]));
  for (const r of results || []) {
    const marks = (r.marks || [])
      .filter((m) => m.subject in max && m.obtained !== "" && m.obtained != null)
      .map((m) => ({ subject: m.subject, obtained: Math.min(Math.max(Number(m.obtained) || 0, 0), max[m.subject]) }));
    map.set(String(r.student), { student: r.student, marks });
  }
  exam.results = [...map.values()];
  await exam.save();
  return Response.json({ exam });
});
