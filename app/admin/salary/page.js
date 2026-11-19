import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import SalaryManager from "@/components/SalaryManager";

export const metadata = { title: "Teacher Salary — The Little Moon Academy" };

export default function AdminSalaryPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || !["superadmin", "admin"].includes(session.role)) redirect("/login");
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/admin/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl text-navy">Teacher Salary</h1>
      <p className="mb-6 mt-1 text-sm text-navy-600">Teacher, month aur amount chunkar salary paid mark karein — teacher apne dashboard se salary slip download kar lega.</p>
      <SalaryManager />
    </div>
  );
}
