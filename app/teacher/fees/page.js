import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import FeeCenter from "@/components/FeeCenter";

export const metadata = { title: "Class Fees — The Little Moon Academy" };

export default function TeacherFeesPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== "teacher") redirect("/login");
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/teacher/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Fee Status — {session.classTeacherOf || "no class"}</h1>
      <p className="mb-6 mt-1 text-sm text-navy-600">Aapki class ki fees. Student cash/receipt number laye to yahan check karein; approval Admin karega.</p>
      {session.classTeacherOf ? <FeeCenter role="teacher" /> : <p className="text-sm text-navy-600">Aap kisi class ke Class Teacher nahi hain.</p>}
    </div>
  );
}
