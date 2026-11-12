export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import AdmitCardManager from "@/components/AdmitCardManager";

export const metadata = { title: "Admit Cards — The Little Moon Academy" };

export default function Page() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || !["superadmin", "admin"].includes(session.role)) redirect("/login");
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Admit Cards</h1>
      <p className="mb-6 mt-1 text-sm text-navy-600">Students select karein, exam / date / description daalein — admit card unke ERP me download ke liye aa jayega.</p>
      <AdmitCardManager />
    </div>
  );
}