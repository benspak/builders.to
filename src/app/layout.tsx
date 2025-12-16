import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "Builders.to - Share your project, get feedback, find your first users",
  description: "A members-only launchpad for builders. Share your work in progress, get feedback from the community, and find your first users. Part of the Builder community on X.",
  keywords: ["builders", "startup", "projects", "feedback", "community", "launch"],
  openGraph: {
    title: "Builders.to",
    description: "Share your project, get feedback, find your first users",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
