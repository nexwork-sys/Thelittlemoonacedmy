import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import StaffManager from "@/components/StaffManager";

export const metadata = { title: "Teachers — The Little Moon Academy" };

export default function AdminStaffPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || !["superadmin", "admin"].includes(session.role)) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/admin/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl text-navy">Teachers</h1>
      <p className="mt-1 text-sm text-navy-600">Teacher add karein — naam, 5-digit PIN, class teacher aur face. Email/password nahi chahiye.</p>
      <div className="mt-8">
        <StaffManager />
      </div>
    </div>
  );
}
