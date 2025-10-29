'use client';

import { useEffect, useState } from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import NextLink from 'next/link';

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  // Return a simple skeleton while not mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">builders.to</div>
          <div className="navbar-links">
            <button className="mobile-menu-btn">
              <HiMenuAlt3 />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  const navLinks = (
    <>
      <NextLink href="/" className="navbar-link">Browse</NextLink>
      <NextLink href="/profiles" className="navbar-link">Builders</NextLink>
      {user ? (
        <>
          <NextLink href="/create-listing" className="navbar-link">Create Listing</NextLink>
          <NextLink href="/dashboard" className="navbar-link">Dashboard</NextLink>
          <NextLink href="/profile" className="navbar-link">Profile</NextLink>
          {user.is_admin && (
            <NextLink href="/admin" className="navbar-link">Admin</NextLink>
          )}
          <button className="btn btn-sm btn-error" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <NextLink href="/login" className="btn btn-sm btn-outline">Login</NextLink>
          <NextLink href="/register" className="btn btn-sm btn-primary">Sign Up</NextLink>
        </>
      )}
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <NextLink href="/" className="navbar-brand">builders.to</NextLink>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navLinks}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <HiMenuAlt3 />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)} />
          <div className="mobile-menu open">
            <button className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
              ×
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
              <NextLink
                href="/"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
                style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem' }}
              >
                Browse
              </NextLink>
              <NextLink
                href="/profiles"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
                style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem' }}
              >
                Builders
              </NextLink>
              {user ? (
                <>
                  <NextLink
                    href="/create-listing"
                    className="navbar-link"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem' }}
                  >
                    Create Listing
                  </NextLink>
                  <NextLink
                    href="/dashboard"
                    className="navbar-link"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem' }}
                  >
                    Dashboard
                  </NextLink>
                  <NextLink
                    href="/profile"
                    className="navbar-link"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem' }}
                  >
                    Profile
                  </NextLink>
                  {user.is_admin && (
                    <NextLink
                      href="/admin"
                      className="navbar-link"
                      onClick={() => setIsMenuOpen(false)}
                      style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem' }}
                    >
                      Admin
                    </NextLink>
                  )}
                </>
              ) : (
                <>
                  <NextLink
                    href="/login"
                    className="btn btn-outline btn-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </NextLink>
                  <NextLink
                    href="/register"
                    className="btn btn-primary btn-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </NextLink>
                </>
              )}
            </div>

            {user && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid', paddingTop: '1rem' }}>
                <button
                  className="btn btn-error btn-full"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
