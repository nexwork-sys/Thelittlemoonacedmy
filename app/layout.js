import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "The Little Moon Academy — Nursery to Class IX, Varanasi",
  description: "The Little Moon Academy, Basani Bazar, Babatpur, Varanasi — an ideal school for your kids. Nursery to Class IX. Admissions open.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-body bg-gray-50 text-ink antialiased">{children}</body>
    </html>
  );
}
