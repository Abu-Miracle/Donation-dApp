import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
    return(
        <div className="flex flex-row justify-between items-center pt-12 pb-4 px-20">
            <div className="flex flex-row items-center gap-3">
                <img 
                src="/logo.svg"
                alt="BlockFund Logo"
                className="w-10 h-10" /> 

                <div>
                    <p className="text-3xl text-[var(--sblue)]">Block
                        <span className="font-bold">Fund</span>
                    </p>
                </div>
            </div>

            <div className="gap-7 flex flex-row items-center">
                <a href="" className="text-xl font- transition-transform 
                        duration-300 active:scale-95 hover:text-[var(--sblue)] font-[600] text-white hover:scale-105">
                    Home
                </a>
                <a href="" className="text-xl font- transition-transform 
                        duration-300 active:scale-95 hover:text-[var(--sblue)] font-[600] text-white hover:scale-105">
                    Created Campaigns
                </a>
                <a href="" className="text-xl font- transition-transform 
                        duration-300 active:scale-95 hover:text-[var(--sblue)] font-[600] text-white hover:scale-105">
                    Donation History
                </a>

                <ConnectButton />
            </div>
        </div>
    );
}