import Image from 'next/image';
import Link from 'next/link';
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub, FaWhatsapp } from 'react-icons/fa';
import {FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#0E0E0E] text-[#B0B0B0] py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-1 mb-2">
                <Image
                src="/logo.svg"
                alt="BlockFund Logo"
                width={28}
                height={28}
                className="w-8 md:w-6 h-8 md:h-6 lg:w-8 lg:h-8"
                />
                <p className="text-xl lg:text-2xl text-[var(--sblue)]">
                Block<span className="font-bold">Fund</span>
                </p>
            </div>
          <p className="text-sm">
            A transparent, blockchain-powered donation platform connecting causes and
            contributors worldwide.
          </p>
        </div>

        <div>
          <h3 className="text-white text-[16px] font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/"><p className="hover:text-white hover:underline text-sm">Home</p></Link></li>
            <li><Link href="#about"><p className="hover:text-white hover:underline text-sm">About Us</p></Link></li>
            <li><Link href="/donate"><p className="hover:text-white hover:underline text-sm">Browse Campaigns</p></Link></li>
            <li><Link href="/newcampaign"><p className="hover:text-white hover:underline text-sm">Create a New Campaign</p></Link></li>
          </ul>
        </div>

        <div>
          <div>
            <h3 className="text-white text-[16px] font-semibold mb-3">Contact</h3>
            <ul className="space-y-2">
              <li><p className="hover:text-white text-sm">+234 912 959 8415</p></li>
              <li><p className="hover:text-white text-sm">+234 909 692 9074</p></li>
            </ul>
          </div>

          <div className='mt-4'>
            <h3 className="text-white text-[16px] font-semibold mb-3">Email</h3>
            <ul className="space-y-2">
            <li>
                <a 
                href="https://mail.google.com/mail/u/0/?fs=1&to=miracleabu07@gmail.com&su=SUBJECT&body=BODY&tf=cm" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline text-sm">
                    miracleabu07@gmail.com
                </a>
              </li>

              <li>
                <a 
                href="https://mail.google.com/mail/u/0/?fs=1&to=miracleabu200@gmail.com&su=SUBJECT&body=BODY&tf=cm" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline text-sm">
                    miracleabu200@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div>
          <h3 className="text-white text-[16px] font-semibold mb-3">Follow Us</h3>
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

      <div className="mt-10 border-t border-[#1E1E1E] pt-6 text-center text-[12px]">
        © {new Date().getFullYear()} BlockFund. All rights reserved.
      </div>
    </footer>
  )
}
