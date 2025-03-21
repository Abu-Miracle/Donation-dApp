'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative flex justify-between items-center pt-7 px-4 pb-4 lg:px-20 bg-transparent text-white ">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="BlockFund Logo"
          width={40}
          height={40}
          className="w-8 h-8 lg:w-10 lg:h-10"
        />
        <p className="text-2xl lg:text-3xl text-[var(--sblue)]">
          Block<span className="font-bold">Fund</span>
        </p>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-6 lg:gap-8">
        {['Home', 'Created Campaigns', 'Donation History'].map((item, index) => (
          <Link
            key={index}
            href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s/g, '')}`}
            className="text-lg font-semibold hover:text-[var(--sblue)] transition-all duration-300 hover:scale-105"
          >
            {item}
          </Link>
        ))}
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
            {['Home', 'Created Campaigns', 'Donation History'].map((item, index) => (
              <Link
                key={index}
                href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s/g, '')}`}
                className="text-xl font-semibold text-white hover:text-[var(--sblue)]"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}

