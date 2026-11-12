import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", style: ["normal", "italic"] });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "The Little Moon Academy — Nursery to Class VIII, Varanasi",
  description: "The Little Moon Academy, Basani Bazar, Babatpur, Varanasi — an ideal school for your kids. Nursery to Class VIII. Admissions open.",
  icons: { icon: "/logo.png" },
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ivory font-body text-ink antialiased">{children}</body>
    </html>
  );
}
