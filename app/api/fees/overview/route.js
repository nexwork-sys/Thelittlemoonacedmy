import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import User from "@/models/User";
import ClassFee from "@/models/ClassFee";
import FeePayment from "@/models/FeePayment";
import SchoolSettings from "@/models/SchoolSettings";
import { requireRole } from "@/lib/auth";
import { feeSummary } from "@/lib/fees";

// Fee dashboard: per-student paid / pending + school totals.
// Admin sees every class; a teacher only sees their own class.
export const GET = requireRole(["superadmin", "admin", "teacher"], async (req, _c, session) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  let className = searchParams.get("className");
  if (session.role === "teacher") {
    const me = await User.findById(session.sub).select("classTeacherOf");
    if (!me?.classTeacherOf) return Response.json({ rows: [], totals: {} });
    className = me.classTeacherOf;
  }
  const filter = { active: true, ...(className ? { className } : {}) };
  const [students, classFees, settings] = await Promise.all([
    Student.find(filter).sort({ className: 1, rollNumber: 1 }).lean(),
    ClassFee.find().lean(),
    SchoolSettings.findOne({ key: "school-settings" }).lean(),
  ]);
  const feeOf = Object.fromEntries(classFees.map((c) => [c.className, c.monthlyFee]));
  const payments = await FeePayment.find({ student: { $in: students.map((s) => s._id) } }).lean();
  const byStudent = {};
  payments.forEach((p) => (byStudent[p.student] ||= []).push(p));

  const rows = students.map((s) => {
    const monthlyFee = s.monthlyFee || feeOf[s.className] || 0;
    const sum = feeSummary({ monthlyFee, payments: byStudent[s._id] || [], startMonth: settings?.sessionStartMonth || 4, admissionDate: s.admissionDate });
    return {
      _id: s._id, studentId: s.studentId, name: s.name, className: s.className, rollNumber: s.rollNumber,
      guardianMobile: s.guardianMobile, lastReminderAt: s.lastReminderAt, docUnlock: !!s.docUnlock, docRequestAt: s.docRequestAt, ...sum, months: undefined,
    };
  });
  const totals = {
    students: rows.length,
    collected: rows.reduce((a, r) => a + r.paid, 0),
    pending: rows.reduce((a, r) => a + r.balance, 0),
    awaitingApproval: rows.reduce((a, r) => a + r.awaiting, 0),
    defaulters: rows.filter((r) => r.balance > 0).length,
  };
  return Response.json({ rows, totals });
});
