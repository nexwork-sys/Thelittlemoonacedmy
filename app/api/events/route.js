import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { getSessionFromRequest } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// GET /api/events — public, powers the Activities & Events gallery
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const filter = { published: true };
  if (category) filter.category = category;

  const events = await Event.find(filter).sort({ eventDate: -1 }).limit(50);
  return Response.json({ events });
}

// POST /api/events — admin, or a Class Teacher publishing an activity/event
// (any class teacher may add — events aren't scoped to one class). Media
// items are either { type: "image", photoDataUri } for a Cloudinary upload,
// or { type: "video", isEmbed: true, url } for an external embed (e.g. YouTube).
export async function POST(req) {
  const session = getSessionFromRequest(req);
  const isAdmin = session && ["superadmin", "admin"].includes(session.role);
  const isClassTeacher = session && session.role === "teacher" && session.classTeacherOf;
  if (!isAdmin && !isClassTeacher) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { heading, description, eventDate, category, mediaItems = [] } = body;

    if (!heading || !description || !eventDate) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const media = [];
    for (const item of mediaItems) {
      if (item.isEmbed) {
        media.push({ type: "video", url: item.url, isEmbed: true });
      } else {
        const uploaded = await uploadToCloudinary(item.photoDataUri, "events");
        media.push({ type: item.type || "image", url: uploaded.url, publicId: uploaded.publicId });
      }
    }

    await connectDB();
    const event = await Event.create({ heading, description, eventDate, category, media });

    return Response.json({ event }, { status: 201 });
  } catch (err) {
    console.error("[events:POST]", err);
    return Response.json({ error: "Could not save event" }, { status: 500 });
  }
}
