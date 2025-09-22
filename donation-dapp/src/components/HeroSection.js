import Link from "next/link";
import Navbar from "./Navbar";

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-[url('/background.svg')] bg-cover bg-center bg-fixed">
      <div className="min-h-screen bg-black/65 flex flex-col">
        <Navbar />
        <div className="my-auto h-full flex flex-col items-center justify-center text-center px-4 py-10">
          <div className="px-3">
            <p className="text-[42px] lg:text-[60px] font-bold text-white leading-[1.1] mb-0 transition-transform duration-300 hover:scale-105">
              Empowering Donations with
              <span className="block mt-3 lg:mt-2">Trust and Transparency</span>
            </p>
            <p className="text-2xl flex-wrap lg:text-[40px] font-bold text-[var(--sblue)] mt-8 transition-transform duration-300 hover:scale-105">
              Powered by The Ethereum Blockchain
            </p>
            <p className="text-xl lg:text-[30px] font-light text-[#E9ECEB] mt-8 transition-transform duration-300 hover:scale-105">
              Be a part of the breakthrough and make someone’s dream come true.
            </p>
          </div>
          <div className="mt-8 lg:mt-14 flex flex-col gap-8 lg:gap-0 lg:flex-row">
            <Link href="/donate">
              <button className="bg-[var(--sblue)] text-black rounded-full text-[20px] font-semibold p-5 px-16 cursor-pointer hover:bg-[var(--light-blue)] border-3 border-[var(--sblue)] hover:border-[var(--light-blue)]">
                Donate Now
              </button>
            </Link>
            <Link href="/newcampaign">
              <button className="bg-transparent border-3 border-white text-white rounded-full text-[20px] font-semibold p-5 px-8 lg:ml-8 cursor-pointer hover:border-transparent hover:text-black hover:bg-[#E9ECEB]">
                Create a Campaign
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
