import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import StaffManager from "@/components/StaffManager";

export const metadata = {
  title: "Teachers — The Little Moon Academy",
};

export default async function AdminStaffPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("school_session")?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session || !["superadmin", "admin"].includes(session.role)) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center text-sm text-navy-400 transition-colors hover:text-navy"
      >
        &larr; Dashboard
      </Link>

      <div className="mt-2">
        <h1 className="font-display text-3xl text-navy">Teachers</h1>
        <p className="mt-1 text-sm text-navy-600">
          Teacher add karein — naam, 5-digit PIN, class teacher aur face.
          Email/password nahi chahiye.
        </p>
      </div>

      <div className="mt-8">
        <StaffManager currentUserRole={session.role} />
      </div>
    </div>
  );
}