import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import SchoolLocationSettings from "@/components/SchoolLocationSettings";
import PaymentSettings from "@/components/PaymentSettings";

export const metadata = {
  title: "Settings — The Little Moon Academy",
};

export default async function AdminSettingsPage() {
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
        className="text-sm text-navy-400 hover:text-navy"
      >
        &larr; Dashboard
      </Link>
      <h1 className="mt-2 font-display text-3xl text-navy">Settings</h1>
      <p className="mt-1 text-sm text-navy-600">
        School-wide configuration for attendance, payments, and access.
      </p>

      <div className="mt-8 space-y-8">
        <SchoolLocationSettings />
        
        {/* Optional: Restrict payment configuration strictly to superadmin */}
        {session.role === "superadmin" && <PaymentSettings />}
      </div>
    </div>
  );
}