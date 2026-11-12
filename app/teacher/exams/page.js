import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import ExamManager from "@/components/ExamManager";

export const metadata = { title: "Class Marks Entry — The Little Moon Academy" };

export default function Page() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || !["teacher"].includes(session.role)) redirect("/login");
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/teacher/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Class Marks Entry</h1>
      <p className="mb-6 mt-1 text-sm text-navy-600">Apni class ke exam ke marks yahan enter karein.</p>
      <ExamManager role="teacher" />
    </div>
  );
}
