import Image from 'next/image';
import Link from 'next/link';
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub, FaWhatsapp } from 'react-icons/fa';
import {FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#0E0E0E] text-[#B0B0B0] py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand / About */}
        <div>
          <div className="flex items-center gap-1 mb-2">
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
          <p className="text-sm">
            A transparent, blockchain-powered donation platform connecting causes and
            contributors worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/"><p className="hover:text-white">Home</p></Link></li>
            <li><Link href="#about"><p className="hover:text-white">About Us</p></Link></li>
            <li><Link href="/donate"><p className="hover:text-white">Browse Campaigns</p></Link></li>
            <li><Link href="/newcampaign"><p className="hover:text-white">Create a New Campaign</p></Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Resources</h3>
          <ul className="space-y-2">
            <li><Link href="/faq"><p className="hover:text-white">FAQ</p></Link></li>
            <li><Link href="/terms"><p className="hover:text-white">Terms of Service</p></Link></li>
            <li><Link href="/privacy"><p className="hover:text-white">Privacy Policy</p></Link></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://x.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <FaXTwitter size={20} />
            </a>
            <a href="https://instagram.com/__abu_m_" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <FaInstagram size={20} />
            </a>
            <a href="https://github.com/yourrepo" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <FaWhatsapp size={20} />
            </a>
            <a href="https://github.com/Abu-Miracle/Donation-dApp" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              <FaGithub size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-[#1E1E1E] pt-6 text-center text-sm">
        © {new Date().getFullYear()} BlockFund. All rights reserved.
      </div>
    </footer>
  )
}
