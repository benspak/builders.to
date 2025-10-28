'use client';

import Navbar from '../src/components/Navbar';

export default function ClientLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh' }} suppressHydrationWarning>
      <Navbar />
      {children}
    </div>
  );
}
