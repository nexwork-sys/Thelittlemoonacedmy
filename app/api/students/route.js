import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import User from "@/models/User";
import { requireRole, isClassTeacherFor } from "@/lib/auth";
import { currentAcademicYear } from "@/lib/fees";

export const GET = requireRole(["superadmin", "admin", "teacher"], async (req) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter = { active: true };
  for (const key of ["className", "section", "academicYear"]) {
    const val = searchParams.get(key);
    if (val) filter[key] = val;
  }
  const students = await Student.find(filter).sort({ className: 1, rollNumber: 1 });
  return Response.json({ students });
});

async function nextStudentId() {
  const yy = String(new Date().getFullYear()).slice(2);
  const prefix = `LMA${yy}-`;
  const last = await Student.findOne({ studentId: new RegExp(`^${prefix}`) }).sort({ studentId: -1 }).select("studentId");
  const n = (parseInt(last?.studentId?.split("-")[1] || "0", 10) || 0) + 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

// Teacher (class teacher of that class) or admin adds a student. A unique Student ID
// is generated automatically - the student opens the Student ERP with that ID.
export const POST = requireRole(["superadmin", "admin", "teacher"], async (req, _ctx, session) => {
  try {
    const body = await req.json();
    if (!body.name || !body.className) {
      return Response.json({ error: "Student name and class are required" }, { status: 400 });
    }
    await connectDB();
    if (session.role === "teacher") {
      const me = await User.findById(session.sub);
      if (!isClassTeacherFor(me, body.className)) {
        return Response.json({ error: "You can only add students to your own class." }, { status: 403 });
      }
    }
    const data = {
      name: body.name, fatherName: body.fatherName, motherName: body.motherName,
      className: body.className, section: body.section || "A",
      rollNumber: body.rollNumber ? Number(body.rollNumber) : undefined,
      guardianMobile: body.guardianMobile, address: body.address,
      gender: body.gender || undefined, dob: body.dob || undefined,
      monthlyFee: Number(body.monthlyFee) || 0,
      academicYear: body.academicYear || currentAcademicYear(),
    };
    let student;
    for (let i = 0; i < 3 && !student; i++) {
      try {
        student = await Student.create({ ...data, studentId: await nextStudentId() });
      } catch (e) {
        if (e.code !== 11000) throw e; // retry on ID race
      }
    }
    return Response.json({ student }, { status: 201 });
  } catch (err) {
    console.error("[students:POST]", err);
    return Response.json({ error: "Could not save student" }, { status: 500 });
  }
});
