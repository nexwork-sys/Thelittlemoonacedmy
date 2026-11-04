import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import ClassFee from "@/models/ClassFee";
import FeePayment from "@/models/FeePayment";
import Attendance from "@/models/Attendance";
import Exam from "@/models/Exam";
import AdmitCard from "@/models/AdmitCard";
import SchoolSettings from "@/models/SchoolSettings";
import { requireRole } from "@/lib/auth";
import { feeSummary, currentAcademicYear, allSessionMonths } from "@/lib/fees";

// Everything the Student ERP needs in one call.
export const GET = requireRole(["student"], async (_req, _c, session) => {
  await connectDB();
  const s = await Student.findById(session.sub).lean();
  if (!s || !s.active) return Response.json({ error: "Student not found" }, { status: 404 });

  const [classFee, payments, settings, exams, admitCards] = await Promise.all([
    ClassFee.findOne({ className: s.className }).lean(),
    FeePayment.find({ student: s._id }).sort({ createdAt: -1 }).lean(),
    SchoolSettings.findOne({ key: "school-settings" }).lean(),
    Exam.find({ className: s.className }).sort({ createdAt: -1 }).lean(),
    AdmitCard.find({ student: s._id }).sort({ createdAt: -1 }).lean(),
  ]);
  const startMonth = settings?.sessionStartMonth || 4;
  const monthlyFee = s.monthlyFee || classFee?.monthlyFee || 0;
  const fees = feeSummary({ monthlyFee, payments, startMonth, admissionDate: s.admissionDate });

  // Attendance % for the current session (present/late = 1, half-day = 0.5, leave ignored)
  const sessionStart = new Date(allSessionMonths(new Date(), startMonth)[0] + "-01T00:00:00");
  const days = await Attendance.find({
    className: s.className, section: s.section, date: { $gte: sessionStart }, "entries.student": s._id,
  }).sort({ date: -1 }).lean();
  let present = 0, absent = 0, counted = 0;
  const log = [];
  for (const d of days) {
    const e = d.entries.find((x) => String(x.student) === String(s._id));
    if (!e) continue;
    log.push({ date: d.date, status: e.status });
    if (e.status === "leave") continue;
    counted++;
    if (e.status === "present" || e.status === "late") present++;
    else if (e.status === "half-day") present += 0.5;
    else absent++;
  }
  const attendance = {
    percent: counted ? Math.round((present / counted) * 1000) / 10 : null,
    totalDays: counted, present, absent, log: log.slice(0, 31),
  };

  const examList = exams.map((x) => {
    const mine = (x.results || []).find((r) => String(r.student) === String(s._id));
    let result = null;
    if (x.resultPublished && mine) {
      const marks = x.subjects.map((sub) => ({
        subject: sub.name, max: sub.maxMarks, obtained: mine.marks.find((m) => m.subject === sub.name)?.obtained ?? null,
      }));
      const got = marks.reduce((a, m) => a + (m.obtained || 0), 0);
      const max = marks.reduce((a, m) => a + (m.obtained == null ? 0 : m.max), 0);
      result = { marks, total: got, max, percent: max ? Math.round((got / max) * 1000) / 10 : 0 };
    }
    return { _id: x._id, name: x.name, venue: x.venue, subjects: x.subjects, admitCardOpen: x.admitCardOpen, resultPublished: x.resultPublished, result };
  });

  // Downloads (admit card / result PDF) stay locked while fees are pending,
  // until the Admin approves this student.
  const locked = fees.balance > 0 && !s.docUnlock;

  return Response.json({
    locked, requested: !!s.docRequestAt && locked,
    admitCards: admitCards.map((a) => ({ _id: a._id, examName: a.examName, date: a.date, time: a.time, venue: a.venue, description: a.description })),
    student: {
      studentId: s.studentId, name: s.name, className: s.className, section: s.section, rollNumber: s.rollNumber,
      fatherName: s.fatherName, motherName: s.motherName, dob: s.dob, guardianMobile: s.guardianMobile,
      academicYear: s.academicYear || currentAcademicYear(), photoUrl: s.photoUrl,
      lastReminderAt: s.lastReminderAt,
    },
    fees: { ...fees, payments },
    attendance,
    exams: examList,
    school: { name: settings?.schoolName, upiId: settings?.upiId, upiQrUrl: settings?.upiQrUrl, phone: settings?.phone },
    allMonths: allSessionMonths(new Date(), startMonth),
  });
});
