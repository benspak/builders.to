'use client';

import { useEffect, useState, useRef } from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import NextLink from 'next/link';
import axios from '../lib/axios';

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const { user, logout } = useAuth();
  const router = useRouter();
  const avatarMenuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (user) {
        try {
          const response = await axios.get('/api/tokens/balance');
          setTokenBalance(response.data.tokens || 0);
        } catch (error) {
          console.error('Failed to fetch token balance:', error);
          setTokenBalance(0);
        }
      }
    };

    fetchTokenBalance();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    };

    if (isAvatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAvatarMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMenuOpen(false);
    setIsAvatarMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return null;
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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
      {user && (
        <>
          <NextLink href="/dashboard" className="navbar-link">Dashboard</NextLink>
          <NextLink href="/create-listing" className="navbar-link">Create Listing</NextLink>
        </>
      )}
      {user ? (
        <div className="avatar-menu-container" ref={avatarMenuRef}>
          <button
            className="avatar-menu-button"
            onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            aria-label="User menu"
          >
            <div className="avatar avatar-sm" style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px 0' }}>
              {getInitials(user.name) ? (
                getInitials(user.name)
              ) : (
                <>
                  <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>🧑‍💻</span>
                  <span style={{ fontSize: '0.65rem', lineHeight: '1', fontWeight: '600', marginTop: '1px' }}>{tokenBalance}</span>
                </>
              )}
            </div>
          </button>
          {isAvatarMenuOpen && (
            <div className="avatar-menu-dropdown">
              <NextLink
                href="/profile"
                className="avatar-menu-item"
                onClick={() => setIsAvatarMenuOpen(false)}
              >
                Profile
              </NextLink>
              <NextLink
                href="/tokens"
                className="avatar-menu-item"
                onClick={() => setIsAvatarMenuOpen(false)}
              >
                Tokens
              </NextLink>
              <NextLink
                href="/referrals"
                className="avatar-menu-item"
                onClick={() => setIsAvatarMenuOpen(false)}
              >
                Referrals
              </NextLink>
              {user.is_admin && (
                <NextLink
                  href="/admin"
                  className="avatar-menu-item"
                  onClick={() => setIsAvatarMenuOpen(false)}
                >
                  Admin
                </NextLink>
              )}
              <div className="avatar-menu-divider"></div>
              <button
                className="avatar-menu-item avatar-menu-item-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
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
                    href="/tokens"
                    className="navbar-link"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem' }}
                  >
                    Tokens
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
                    href="/referrals"
                    className="navbar-link"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ display: 'block', padding: '0.75rem', borderRadius: '0.5rem' }}
                  >
                    Referrals
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
