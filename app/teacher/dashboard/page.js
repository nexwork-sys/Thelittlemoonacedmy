import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import GoToLiveLink from "@/components/GoToLiveLink";

export const metadata = { title: "Teacher Dashboard — The Little Moon Academy" };

const MODULES = [
  { href: "/teacher/punch", title: "Punch In / Out", desc: "Face + location verified daily attendance, school ke andar se." },
  { href: "/teacher/attendance", title: "Mark Attendance", desc: "Apni class ki daily student attendance." },
];

// Shown only to teachers who are designated as a Class Teacher (CT).
const CT_MODULES = [
  { href: "/teacher/students", title: "Add Student & Roster", desc: "Naya student add karein, Student ID banegi jisse student ERP khulta hai." },
  { href: "/teacher/fees", title: "Fee Status (My Class)", desc: "Class ki pending fees, receipt number check." },
  { href: "/teacher/exams", title: "Marks Entry", desc: "Apni class ke exam ke marks enter karein." },
  { href: "/teacher/attendance-sheet", title: "Attendance Sheet", desc: "Monthly P/A grid, Excel download." },
  { href: "/teacher/toppers", title: "Topper's Corner", desc: "Homepage par toppers add karein." },
  { href: "/teacher/activities", title: "Activities & Events", desc: "Events gallery me photos/videos publish karein." },
];

export default function TeacherDashboardPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;

  if (!session || session.role !== "teacher") {
    redirect("/login");
  }

  const modules = session.classTeacherOf ? [...MODULES, ...CT_MODULES] : MODULES;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm italic text-brass-600">Welcome back, {session.name}</p>
          <h1 className="mt-1 font-display text-3xl text-navy">Teacher Dashboard</h1>
          {session.classTeacherOf && (
            <p className="mt-1 text-sm text-navy-600">Class Teacher of {session.classTeacherOf}</p>
          )}
        </div>
        <GoToLiveLink />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
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
