'use client';

import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import Link from "next/link";
import "./globals.css";
import App from "next/app";


export default function Home() {
  return (
    <div className="overflow-hidden">  
      <HeroSection />
      <HowItWorks />
    </div> 
  );
}
