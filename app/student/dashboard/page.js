export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import StudentERP from "@/components/StudentERP";

export const metadata = { title: "Student ERP — The Little Moon Academy" };

export default function StudentDashboardPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== "student") redirect("/login?type=student");
  return <StudentERP />;
}