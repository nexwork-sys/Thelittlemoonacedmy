
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      ok: true,
      message: "MongoDB connected successfully"
    });

  } catch (error) {
    console.error("[health]", error);

    return Response.json({
      ok: false,
      message: "MongoDB connection failed"
    }, { status: 503 });
  }
}
