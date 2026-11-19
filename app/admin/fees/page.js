import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import FeeCenter from "@/components/FeeCenter";

export const metadata = { title: "Fees — The Little Moon Academy" };

export default function AdminFeesPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || !["superadmin", "admin"].includes(session.role)) redirect("/login");
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/admin/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Fees</h1>
      <p className="mb-6 mt-1 text-sm text-navy-600">Kitni fees jama hui, kiski pending hai, payment approvals aur reminders.</p>
      <FeeCenter role="admin" />
    </div>
  );
}
