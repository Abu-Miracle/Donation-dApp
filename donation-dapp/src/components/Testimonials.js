// components/Testimonials.js
'use client'

import Image from 'next/image'
import { useRef } from 'react'

const testimonials = [
  {
    quote: "This platform transformed how we raise funds—total transparency and trust.",
    name: "Amina Yusuf",
    title: "Founder – Hope Foundation",
    avatar: "/portraits/amina.jpg",
  },
  {
    quote: "Donors loved seeing exactly where their money goes, on-chain.",
    name: "Carlos Diaz",
    title: "CEO – ReliefNow",
    avatar: "/portraits/carlos.jpg",
  },
  {
    quote: "Creating campaigns was a breeze, and approvals are lightning fast.",
    name: "Priya Singh",
    title: "Director – AidAfrica",
    avatar: "/portraits/priya.jpg",
  },
  {
    quote: "I’ve never seen donor engagement this high—people feel part of the story.",
    name: "Omar Abdallah",
    title: "Coordinator – ShelterUp",
    avatar: "/portraits/omar.jpg",
  },
  {
    quote: "A game-changer for charity on web3. Simple, secure, and scalable.",
    name: "Lin Wu",
    title: "CTO – ChainForGood",
    avatar: "/portraits/lin.jpg",
  },
]

export default function Testimonials() {
  const containerRef = useRef(null)

  return (
    <div className="pt-14 pb-10 bg-black">
      <p className="text-[#747474] text-xl font-black text-center mb-2">TESTIMONIALS</p>
      <h2 className="text-white text-3xl font-bold text-center mb-4">
        What Our Users Say
      </h2>

      <div
        id='editModal'
        ref={containerRef}
        className="relative overflow-x-auto mr-10 py-10"
      >
        <div className="flex space-x-8 pl-10">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-70 bg-[var(--dark-gray)] rounded-xl hover:bg-[#1e1e1e] transition-transform duration-300 hover:scale-105 py-10 px-6"
            >
              <div className="text-7xl text-[var(--light-gray)] font-bold mb-4">“</div>
              <p className="text-[#c0c0c0] mb-8 text-justify">{t.quote}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="object-cover object-center"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-[#747474] text-sm">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
