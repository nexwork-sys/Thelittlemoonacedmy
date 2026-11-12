import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import EventManager from "@/components/EventManager";

export const metadata = { title: "Activities & Events — The Little Moon Academy" };

export default function TeacherActivitiesPage() {
  const token = cookies().get("school_session")?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== "teacher") redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/teacher/dashboard" className="text-sm text-navy-400 hover:text-navy">&larr; Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl text-navy">Activities &amp; Events</h1>

      {!session.classTeacherOf ? (
        <p className="mt-4 text-sm text-navy-600">
          You are not currently assigned as a Class Teacher, so there&apos;s nothing to manage here.
          Ask an Admin to set your Class Teacher designation from Staff Accounts.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-navy-600">
            Publish photos, videos and write-ups for the public events gallery. Removing an entry is
            reserved for Admin — if something needs to come down, let the office know.
          </p>
          <div className="mt-8">
            <EventManager canDelete={false} />
          </div>
        </>
      )}
    </div>
  );
}
