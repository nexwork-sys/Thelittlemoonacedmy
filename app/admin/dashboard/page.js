export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import DashboardCards from "@/components/DashboardCards";
import GoToLiveLink from "@/components/GoToLiveLink";

export const metadata = { title: "Admin Dashboard — The Little Moon Academy" };

const MODULES = [
  { href: "/admin/fees", title: "Fees", desc: "Kitni fees jama hui, kiski pending hai, payment approvals aur reminders." },
  { href: "/admin/admit-cards", title: "Admit Cards", desc: "Students chunkar admit card generate karein; unke ERP me download hoga." },
  { href: "/admin/exams", title: "Exams & Results", desc: "Exam time table, marks entry aur result publish karna." },
  { href: "/admin/staff", title: "Teachers", desc: "Teacher add karein: PIN, class teacher, face recognition." },
  { href: "/admin/students", title: "Students & Attendance", desc: "Class-wise student list, Student ID aur daily attendance." },
  { href: "/admin/teacher-attendance", title: "Teacher Attendance & Logs", desc: "Daily check-in/check-out logs, monthly Excel export." },
  { href: "/admin/inquiries", title: "Admission Inquiries", desc: "Website se aaye admission inquiries." },
  { href: "/admin/toppers", title: "Topper's Corner", desc: "Homepage par dikhne wale toppers." },
  { href: "/admin/events", title: "Activities & Events", desc: "Events gallery: photos, videos aur write-ups." },
  { href: "/admin/settings", title: "Settings", desc: "School location, UPI QR aur attendance timing." },
];

export default function AdminDashboardPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;

  if (!session || !["superadmin", "admin"].includes(session.role)) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm italic text-brass-600">Welcome back, {session.name}</p>
          <h1 className="mt-1 font-display text-3xl text-navy">Admin Dashboard</h1>
        </div>
        <GoToLiveLink />
      </div>

      <div className="mt-6">
        <DashboardCards />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brass hover:shadow-md"
          >
            <h2 className="font-display text-lg text-navy">{m.title}</h2>
            <p className="mt-1.5 text-sm text-navy-600">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}