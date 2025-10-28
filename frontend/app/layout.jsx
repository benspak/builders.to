import { AuthProvider } from '../src/context/AuthContext';
import Providers from './providers';
import ClientLayout from './client-layout';
import '../src/index.css';

export const metadata = {
  title: 'Builders.to - Marketplace for Builders and Founders',
  description: 'Find builders, join teams, and buy businesses on the Builders.to marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
