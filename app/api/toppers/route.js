import { connectDB } from "@/lib/mongodb";
import Topper from "@/models/Topper";
import { getSessionFromRequest } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// GET /api/toppers — public, powers the "Topper's Corner" grid
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const academicYear = searchParams.get("year");

  const filter = { featured: true };
  if (academicYear) filter.academicYear = academicYear;

  const toppers = await Topper.find(filter).sort({ rank: 1, displayOrder: 1 });
  return Response.json({ toppers });
}

// POST /api/toppers — admin, or a Class Teacher adding a topper for their
// own class (className is forced server-side to session.classTeacherOf so a
// class teacher can't add a topper into another class).
export async function POST(req) {
  const session = getSessionFromRequest(req);
  const isAdmin = session && ["superadmin", "admin"].includes(session.role);
  const isClassTeacher = session && session.role === "teacher" && session.classTeacherOf;
  if (!isAdmin && !isClassTeacher) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { studentName, academicYear, rank, percentage, photoDataUri } = body;
    const className = isClassTeacher ? session.classTeacherOf : body.className;

    if (!studentName || !className || !academicYear || !rank || percentage == null) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    let photoUrl, photoPublicId;
    if (photoDataUri) {
      const uploaded = await uploadToCloudinary(photoDataUri, "toppers");
      photoUrl = uploaded.url;
      photoPublicId = uploaded.publicId;
    }

    await connectDB();
    const topper = await Topper.create({
      studentName,
      className,
      academicYear,
      rank,
      percentage,
      photoUrl,
      photoPublicId,
    });

    return Response.json({ topper }, { status: 201 });
  } catch (err) {
    console.error("[toppers:POST]", err);
    return Response.json({ error: "Could not save topper" }, { status: 500 });
  }
}
