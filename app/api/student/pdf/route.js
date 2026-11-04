import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import ClassFee from "@/models/ClassFee";
import FeePayment from "@/models/FeePayment";
import AdmitCard from "@/models/AdmitCard";
import Exam from "@/models/Exam";
import SchoolSettings from "@/models/SchoolSettings";
import { requireRole } from "@/lib/auth";
import { feeSummary } from "@/lib/fees";

export const runtime = "nodejs";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-");
const NAVY = "#0b192c";

function header(doc, title, settings) {
  const logo = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logo)) doc.image(logo, 40, 36, { width: 62 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text((settings?.schoolName || "The Little Moon Academy").toUpperCase(), 115, 44);
  doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Basani Bazar, Babatpur, Varanasi", 115, 68);
  doc.moveTo(40, 110).lineTo(555, 110).lineWidth(2).strokeColor(NAVY).stroke();
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(15).text(title, 40, 125, { align: "center", width: 515 });
  doc.y = 155;
}
function kv(doc, pairs) {
  pairs.forEach(([k, v]) => {
    doc.font("Helvetica").fontSize(11).fillColor("#64748b").text(`${k}: `, { continued: true }).font("Helvetica-Bold").fillColor("#111827").text(String(v ?? "-"));
    doc.moveDown(0.3);
  });
}

// GET /api/student/pdf?type=admit&id=<admitCardId>   |   ?type=result&id=<examId>
// Blocked (403) while fees are pending unless Admin approved this student.
export const GET = requireRole(["student"], async (req, _c, session) => {
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type"), id = sp.get("id");
  await connectDB();
  const s = await Student.findById(session.sub).lean();
  if (!s) return Response.json({ error: "Student not found" }, { status: 404 });

  const [classFee, payments, settings] = await Promise.all([
    ClassFee.findOne({ className: s.className }).lean(),
    FeePayment.find({ student: s._id }).lean(),
    SchoolSettings.findOne({ key: "school-settings" }).lean(),
  ]);
  const fees = feeSummary({ monthlyFee: s.monthlyFee || classFee?.monthlyFee || 0, payments, startMonth: settings?.sessionStartMonth || 4, admissionDate: s.admissionDate });
  if (fees.balance > 0 && !s.docUnlock) {
    return Response.json({ error: "Fees pending hai. Admin ki approval ke baad download hoga." }, { status: 403 });
  }

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((r) => doc.on("end", r));
  let filename = "document.pdf";

  if (type === "admit") {
    const card = await AdmitCard.findOne({ _id: id, student: s._id }).lean();
    if (!card) return Response.json({ error: "Admit card not found" }, { status: 404 });
    header(doc, `ADMIT CARD — ${card.examName}`, settings);
    kv(doc, [["Student Name", s.name], ["Student ID", s.studentId], ["Class", `${s.className} (${s.section})`], ["Roll No", s.rollNumber],
      ["Father's Name", s.fatherName], ["Exam", card.examName], ["Date", fmt(card.date)], ["Time", card.time], ["Venue", card.venue || settings?.schoolName || "School campus"]]);
    if (card.description) {
      doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text("Instructions / Description");
      doc.font("Helvetica").fontSize(11).fillColor("#111827").text(card.description);
    }
    doc.moveDown(4);
    const y = doc.y;
    doc.fontSize(10).fillColor("#475569").text("Class Teacher", 40, y).text("Principal / Admin", 440, y);
    filename = `admit-card-${s.studentId}.pdf`;
  } else if (type === "result") {
    const exam = await Exam.findOne({ _id: id, className: s.className, resultPublished: true }).lean();
    const mine = exam?.results?.find((r) => String(r.student) === String(s._id));
    if (!exam || !mine) return Response.json({ error: "Result not available" }, { status: 404 });
    header(doc, `RESULT — ${exam.name}`, settings);
    kv(doc, [["Student Name", s.name], ["Student ID", s.studentId], ["Class", `${s.className} (${s.section})`], ["Roll No", s.rollNumber], ["Father's Name", s.fatherName]]);
    doc.moveDown(0.8);
    const x = [40, 300, 400, 480];
    let y = doc.y;
    doc.rect(40, y - 4, 515, 22).fill("#eef2f8");
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text("Subject", x[0] + 6, y).text("Max", x[1], y).text("Obtained", x[2], y);
    y += 26;
    let got = 0, max = 0;
    exam.subjects.forEach((sub) => {
      const o = mine.marks.find((m) => m.subject === sub.name)?.obtained;
      if (o != null) { got += o; max += sub.maxMarks; }
      doc.font("Helvetica").fillColor("#111827").text(sub.name, x[0] + 6, y).text(String(sub.maxMarks), x[1], y).text(o == null ? "-" : String(o), x[2], y);
      doc.moveTo(40, y + 16).lineTo(555, y + 16).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
      y += 24;
    });
    doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY).text(`Total: ${got} / ${max}    Percentage: ${max ? Math.round((got / max) * 1000) / 10 : 0}%`, 40, y + 12);
    filename = `result-${s.studentId}.pdf`;
  } else {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  doc.end();
  await done;
  return new Response(Buffer.concat(chunks), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"` },
  });
});
