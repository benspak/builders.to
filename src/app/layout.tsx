import type { Metadata } from "next";
import { Inter, Poppins, Work_Sans } from "next/font/google";
import "./globals.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackgroundLogo from "../components/BackgroundLogo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "LaunchKit - Launch faster. Grow smarter.",
  description: "Get your MVP in 21 days. Beat competitors to market and start raising money.",
  icons: {
    icon: '/fav-logo.ico',
    shortcut: '/fav-logo.ico',
    apple: '/fav-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${workSans.variable}`}>
      <head>
        <link rel="icon" href="/fav-logo.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/fav-logo.png" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <BackgroundLogo />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
