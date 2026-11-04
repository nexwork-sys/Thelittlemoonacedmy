import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import TopperManager from "@/components/TopperManager";

export const metadata = { title: "Topper's Corner — The Little Moon Academy" };

export default function TeacherToppersPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== "teacher") redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/teacher/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl text-navy">Topper&apos;s Corner</h1>

      {!session.classTeacherOf ? (
        <p className="mt-4 text-sm text-navy-600">
          You are not currently assigned as a Class Teacher, so there&apos;s nothing to manage here.
          Ask an Admin to set your Class Teacher designation from Staff Accounts.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-navy-600">
            Add toppers from {session.classTeacherOf} to the public homepage. You can only add or remove
            toppers for your own class — other classes are managed by their own Class Teacher or Admin.
          </p>
          <div className="mt-8">
            <TopperManager restrictClassName={session.classTeacherOf} />
          </div>
        </>
      )}
    </div>
  );
}
