import Image from "next/image";
import Link from "next/link";
import AdmissionInquiryModal from "./AdmissionInquiryModal";
import { SOCIAL, CREDIT } from "@/lib/siteConfig";

function Instagram() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Facebook() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z" />
    </svg>
  );
}

export default function Footer() {
  const social = "grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-brass hover:text-navy";
  return (
    <footer id="contact" className="bg-navy-900 text-white/80">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 py-10 md:grid-cols-12">
          <div className="space-y-4 md:col-span-5">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="The Little Moon Academy" width={56} height={56} className="h-14 w-14 rounded-full bg-white" />
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight text-white">The Little Moon Academy</h3>
                <p className="text-xs text-white/60">Nursery to Class VIII</p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/65">Bachchon ke sampoorn vikas ke liye samarpit school — achhi padhai, anushasan aur sanskaar ke saath.</p>
          </div>

          <div className="space-y-3 md:col-span-4">
            <h4 className="font-semibold text-white">Visit &amp; follow us</h4>
            <p className="text-sm">Basani Bazar, Babatpur,<br />Varanasi, Uttar Pradesh</p>
            <div className="flex gap-3 pt-1">
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="The Little Moon Academy on Instagram" className={social}><Instagram /></a>
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="The Little Moon Academy on Facebook" className={social}><Facebook /></a>
            </div>
          </div>

          <div className="space-y-3 md:col-span-3">
            <h4 className="font-semibold text-white">ERP portal</h4>
            <Link href="/login?type=student" className="block text-sm transition hover:text-brass">Student login</Link>
            <Link href="/login?type=staff" className="block text-sm transition hover:text-brass">Admin / Teacher login</Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 py-5 text-center text-xs text-white/55 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} The Little Moon Academy. All rights reserved.</p>
          <AdmissionInquiryModal triggerLabel="ADMISSION ENQUIRY" triggerClassName="rounded border-2 border-amber-400 px-4 py-1.5 text-xs font-bold uppercase text-white transition hover:bg-amber-400 hover:text-navy" />
        </div>
        <p className="pb-6 text-center text-xs text-white/55">Designed &amp; Developed by <strong className="font-semibold text-brass">{CREDIT.text}</strong></p>
      </div>
    </footer>
  );
}
