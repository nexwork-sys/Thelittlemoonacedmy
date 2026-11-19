import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { connectDB } from "@/lib/mongodb";
import SalaryPayment from "@/models/SalaryPayment";
import User from "@/models/User";
import SchoolSettings from "@/models/SchoolSettings";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

const NAVY = "#0b192c";
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const monthName = (m) => { const [y, mm] = m.split("-").map(Number); return `${MONTHS[mm - 1]} ${y}`; };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-");
const inr = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

// GET /api/salary/:id/slip — salary slip PDF.
// Admin can download any slip; a teacher only their own.
export const GET = requireRole(["superadmin", "admin", "teacher"], async (_req, ctx, session) => {
  await connectDB();
  const p = await SalaryPayment.findById(ctx.params.id).lean();
  if (!p) return Response.json({ error: "Slip nahi mili" }, { status: 404 });
  if (session.role === "teacher" && String(p.teacher) !== String(session.sub)) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const [t, settings] = await Promise.all([
    User.findById(p.teacher).select("name teacherId phone classTeacherOf").lean(),
    SchoolSettings.findOne({ key: "school-settings" }).lean(),
  ]);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((r) => doc.on("end", r));

  const logo = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(logo)) doc.image(logo, 40, 36, { width: 62 });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text((settings?.schoolName || "The Little Moon Academy").toUpperCase(), 115, 44);
  doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Basani Bazar, Babatpur, Varanasi", 115, 68);
  doc.moveTo(40, 110).lineTo(555, 110).lineWidth(2).strokeColor(NAVY).stroke();
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(15).text(`SALARY SLIP - ${monthName(p.month).toUpperCase()}`, 40, 125, { align: "center", width: 515 });

  const rows = [
    ["Slip No.", p.slipNo],
    ["Teacher Name", t?.name || p.teacherName],
    ["Teacher ID", t?.teacherId || p.teacherId || "-"],
    ["Class Teacher of", t?.classTeacherOf || "-"],
    ["Salary Month", monthName(p.month)],
    ["Payment Date", fmt(p.paidAt)],
    ["Payment Mode", String(p.mode).toUpperCase()],
  ];
  if (p.note) rows.push(["Remarks", p.note]);
  let y = 170;
  rows.forEach(([k, v]) => {
    doc.font("Helvetica").fontSize(11).fillColor("#64748b").text(k, 60, y, { width: 150 });
    doc.font("Helvetica-Bold").fillColor("#111827").text(String(v), 215, y, { width: 330 });
    y += 24;
  });

  y += 10;
  doc.rect(40, y, 515, 50).fillAndStroke("#FFF8E1", "#FFC53D");
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12).text("NET SALARY PAID", 60, y + 17);
  doc.fontSize(18).text(inr(p.amount), 300, y + 14, { width: 235, align: "right" });
  y += 70;
  doc.font("Helvetica").fontSize(10).fillColor("#16a34a").text("Status: PAID", 60, y);

  doc.font("Helvetica").fontSize(10).fillColor("#475569");
  doc.text("Teacher's Signature", 60, 690);
  doc.text(`Authorised Signatory${p.paidByName ? ` (${p.paidByName})` : ""}`, 350, 690, { width: 205, align: "right" });
  doc.moveTo(60, 685).lineTo(200, 685).strokeColor("#94a3b8").lineWidth(1).stroke();
  doc.moveTo(380, 685).lineTo(555, 685).stroke();
  doc.fontSize(9).fillColor("#94a3b8").text("This is a computer-generated salary slip.", 40, 770, { align: "center", width: 515 });
  doc.end();
  await done;

  return new Response(Buffer.concat(chunks), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Salary-Slip-${p.month}-${p.slipNo}.pdf"`,
    },
  });
});
