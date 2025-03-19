'use client';

import Image from "next/image";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";


export default function Home() {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
    </div> 
  );
}
