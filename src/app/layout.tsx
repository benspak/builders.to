import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ViewTracker } from "@/components/analytics/view-tracker";

export const metadata: Metadata = {
  title: "Builders.to - Share your project, get feedback, find your first users",
  description: "A members-only launchpad for builders. Share your work in progress, get feedback from the community, and find your first users. Part of the Builders.to community on X.",
  keywords: ["builders", "startup", "projects", "feedback", "community", "launch"],
  metadataBase: new URL("https://builders.to"),
  openGraph: {
    title: "Builders.to - Ship faster. Together.",
    description: "Share your project, get feedback, find your first users. A members-only launchpad for builders who ship.",
    type: "website",
    siteName: "Builders.to",
  },
  twitter: {
    card: "summary_large_image",
    title: "Builders.to - Ship faster. Together.",
    description: "Share your project, get feedback, find your first users. A members-only launchpad for builders who ship.",
    creator: "@builderstoHQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash on page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NT4L97CNE8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NT4L97CNE8');
          `}
        </Script>

        {/* LinkedIn Insight Tag */}
        <Script id="linkedin-partner-id" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "8477220";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          `}
        </Script>
        <Script
          id="linkedin-insight"
          strategy="afterInteractive"
          src="https://snap.licdn.com/li.lms-analytics/insight.min.js"
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src="https://px.ads.linkedin.com/collect/?pid=8477220&fmt=gif"
          />
        </noscript>
        <ThemeProvider>
          <AuthProvider>
            <ViewTracker />
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
