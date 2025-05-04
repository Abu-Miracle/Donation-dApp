import Image from "next/image";
import Link from "next/link";

export default function Mission() {
    return(
        <div className="min-h-[85vh] flex flex-col justify-center bg-[#1e1e1e] px-10 pt-14 pb-14">
            <h1 className="text-[var(--sblue)] font-black text-3xl block text-center pb-10 md:hidden">OUR MISSION</h1>

            <div className="flex flex-col md:flex-row justify-center items-center md:space-x-12">

                <div className="group relative overflow-hidden rounded-full shadow-lg shadow-[#3CA8CF]/30 w-80 h-40 mb-10 md:mb-0">

                    <div className="absolute inset-0 bg-[url('/stock2.jpg')] bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110 rounded-full" />

                    <div className="w-full h-full bg-gradient-to-b from-transparent from-20% to-black flex flex-col items-start justify-end px-10 pb-4 relative z-10">
                        <p className="text-lg font-bold text-white">
                            Global Impact
                        </p>
                        <p className="text-sm text-[#c0c0c0]">
                            Reaching those in need across borders, no matter the distance
                        </p>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-full shadow-lg shadow-[#3CA8CF]/30 w-80 h-40 mb-10 md:mb-0">

                    <div className="absolute inset-0 bg-[url('/stock5.jpg')] bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110 rounded-full" />

                    <div className="w-full h-full bg-gradient-to-b from-transparent from-20% to-black flex flex-col items-start justify-end px-10 pb-4 relative z-10">
                        <p className="text-lg font-bold text-white">
                            Transparent Giving
                        </p>
                        <p className="text-sm text-[#c0c0c0]">
                            Every donation is tracked on the blockchain for complete transparency
                        </p>
                    </div>
                </div>

                
            </div>
            
            <div className="flex flex-col md:flex-row justify-center items-center md:space-x-16 mt-10">
                <div className="group relative overflow-hidden rounded-full shadow-lg shadow-[#3CA8CF]/30 w-80 h-40 mb-10 md:mb-0">

                    <div className="absolute inset-0 bg-[url('/stock4.jpg')] bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110 rounded-full" />

                    <div className="w-full h-full bg-gradient-to-b from-transparent from-20% to-black flex flex-col items-start justify-end px-10 pb-4 relative z-10">
                        <p className="text-lg font-bold text-white">
                            Empowering Communities
                        </p>
                        <p className="text-sm text-[#c0c0c0]">
                            Supporting lives and rebuilding hope where it is needed most
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-center gap-[2px] ">
                    <Image
                        src="/logo.svg"
                        alt="BlockFund Logo"
                        width={28}
                        height={28}
                        className="w-8 md:w-20 h-6 md:h-15 lg:w-20 lg:h-15"
                    />
                    <p className="hidden md:block text-xl lg:text-2xl font-medium text-[var(--sblue)]">
                        OUR <span className="font-black">MISSION</span>
                    </p>
                </div>

                <div className="group relative overflow-hidden rounded-full shadow-lg shadow-[#3CA8CF]/30 w-80 h-40">

                    <div className="absolute inset-0 bg-[url('/stock3.jpg')] bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110 rounded-full" />

                    <div className="w-full h-full bg-gradient-to-b from-transparent from-20% to-black flex flex-col items-start justify-end px-10 pb-4 relative z-10">
                        <p className="text-lg font-bold text-white">
                            Trusted Donations
                        </p>
                        <p className="text-sm text-[#c0c0c0]">
                            Secure, verifiable campaigns you can believe in
                        </p>
                       
                    </div>
                </div>
            </div>

            <div className="bg-[#0e0e0e] text-center text-white font-medium w-[100vw] -mx-10 px-10 md:px-0 py-6 text-3xl mt-10 md:mt-12 mb-10 md:mb-8">
                Uniting <span className="font-black">Millions</span> in Need Through Blockchain Technology
            </div>

            <Link href="/donate">
              <button className='bg-[var(--sblue)] block mx-auto text-black rounded-full text-lg py-3 px-10 cursor-pointer hover:bg-[var(--light-blue)] font-black'>
                Donate Now
              </button>
            </Link>

        </div>
    );
}