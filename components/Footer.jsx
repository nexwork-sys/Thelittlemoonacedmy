import Image from "next/image";
import Link from "next/link";
import AdmissionInquiryModal from "./AdmissionInquiryModal";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-gray-200 bg-slate-50 pt-10 text-sm text-gray-800">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 border-b border-gray-200 pb-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="The Little Moon Academy" width={64} height={64} className="rounded-full" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-wide text-red-800">The Little Moon Academy</h3>
                <p className="text-xs font-bold tracking-wider text-gray-700">An Ideal School For Your Kids</p>
                <p className="text-[10px] text-gray-500">Nursery to Class IX</p>
              </div>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-gray-600">
              Bachchon ke sampoorn vikas ke liye samarpit school — achhi padhai, anushasan aur sanskaar ke saath.
            </p>
          </div>

          <div className="space-y-3 lg:col-span-4">
            <h4 className="text-base font-bold uppercase tracking-wider text-gray-900">Connect With Us</h4>
            <p className="flex items-start gap-3 text-gray-700"><span aria-hidden>📍</span><span>Basani Bazar, Babatpur,<br />Varanasi, Uttar Pradesh</span></p>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <h4 className="text-base font-bold uppercase tracking-wider text-gray-900">ERP Portal</h4>
            <Link href="/login?type=student" className="block hover:text-brass-600">Student Login →</Link>
            <Link href="/login?type=staff" className="block hover:text-brass-600">Admin / Teacher Login →</Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 py-4 text-xs text-gray-600 md:flex-row">
          <p>© {new Date().getFullYear()} <strong className="text-gray-800">The Little Moon Academy</strong>. All rights reserved.</p>
          <AdmissionInquiryModal triggerLabel="ADMISSION ENQUIRY" triggerClassName="rounded border-2 border-amber-400 px-4 py-1.5 text-xs font-bold uppercase text-navy transition hover:bg-amber-400" />
        </div>
      </div>
    </footer>
  );
}
