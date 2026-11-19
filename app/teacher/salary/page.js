import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import TeacherSalary from "@/components/TeacherSalary";

export const metadata = { title: "My Salary — The Little Moon Academy" };

export default function TeacherSalaryPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== "teacher") redirect("/login");
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/teacher/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl text-navy">My Salary</h1>
      <p className="mb-6 mt-1 text-sm text-navy-600">Jo salary Admin ne paid mark ki hai, uski slip yahan se download karein.</p>
      <TeacherSalary />
    </div>
  );
}
