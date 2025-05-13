'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
  const isAdmin = isConnected && address?.toLowerCase() === adminAddress?.toLowerCase();

  // Define the common navigation items for regular users.
  const navLinks = ['Home', 'Created Campaigns', 'Donation History'];

  // Function to determine if a link is active
  const isActive = (href) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="relative flex justify-between items-center pt-7 px-6 pb-4 xl:px-16 bg-transparent text-white ">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="BlockFund Logo"
          width={28}
          height={28}
          className="w-8 md:w-6 h-8 md:h-6 lg:w-8 lg:h-8"
        />
        <p className="hidden md:block text-xl lg:text-2xl text-[var(--sblue)]">
          Block<span className="font-bold">Fund</span>
        </p>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-3 xl:gap-6">
        {navLinks.map((item, index) => {
          const href = item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s/g, '')}`;
          return (
            <Link
              key={index}
              href={href}
              className={`text-[15px] font-semibold duration-100 transition-all cursor-pointer hover:scale-105 ${
                isActive(href) ? 'text-[var(--sblue)]' : 'hover:text-white'
              }`}
            >
              {item}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={`text-[15px] font-semibold duration-100 transition-all cursor-pointer hover:scale-105 ${
              pathname === '/admin' ? 'text-[var(--sblue)]' : 'hover:text-white'
            }`}
          >
            Admin
          </Link>
        )}
        <ConnectButton />
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center gap-4">
        <ConnectButton />
        <button
          className="text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu with Overlay */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMenuOpen(false)}
          ></div>

          {/* Menu */}
          <div className="fixed top-16 left-0 w-full bg-black z-50 py-6 shadow-lg flex flex-col items-center gap-6">
            {navLinks.map((item, index) => {
              const href = item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s/g, '')}`;
              return (
                <Link
                  key={index}
                  href={href}
                  className={`text-sm font-semibold ${
                    isActive(href) ? 'text-[var(--sblue)]' : 'text-white hover:text-[var(--sblue)]'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-semibold ${
                  pathname === '/admin' ? 'text-[var(--sblue)]' : 'text-white hover:text-[var(--sblue)]'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </div>
        </>
      )}
    </nav>
  );
}