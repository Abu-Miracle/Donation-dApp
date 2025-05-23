export default function HowItWorks() {
    return(
        <div className="h-auto bg-black my-auto flex flex-col justify-center text-center items-center py-16 md:py-20 px-10 md:px-30">
            <div className="justify-center">
                <h1 className="text-white text-4xl font-black">How It Works</h1>
                <p className="mt-8 text-[#E9ECEB] text-[16px] md:text-[20px] font-thin">Effortlessly connect your wallet, select a verified campaign, donate securely  <br /> <span>through our transparent blockchain platform</span></p>
            </div>

            <div className="gap-16 mt-16 md:mt-26 grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3">
                <div className="inset-shadow-sm inset-shadow-[#1e1e1e] pt-16 pb-30 px-10 bg-[#000000] text-white text-start shadow-lg hover:shadow-xl shadow-[#1e1e1e] rounded-xl transition-transform duration-300 hover:scale-105">
                    <img 
                    src="/Wallet.svg" 
                    alt="wallet" 
                    className="w-14 h-14"/>
                    <h1 className="w-40 flex-wrap mt-4 text-[24px] font-bold ">Connect Your Wallet</h1>
                    <p className="mt-16 text-[16px] flex-wrap">Connect your cryptocurrency wallet (like Metamask) to the dApp for secure transactions</p>
                </div>

                <div className="inset-shadow-sm inset-shadow-[#1e1e1e] pt-16 pb-30 px-10 bg-[#000000] text-white text-start shadow-lg hover:shadow-xl shadow-[#1e1e1e] rounded-xl transition-transform duration-300 hover:scale-105">
                    <img 
                    src="/Search Property.svg" 
                    alt="search prop" 
                    className="w-14 h-14"/>
                    <h1 className="xl:w-[260px] lg:flex-wrap mt-4 text-[24px] font-bold">Browse and Select a Campaign</h1>
                    <p className="mt-16 text-[16px] flex-wrap">Browse and select a campaign of your choice who cause you may want to support </p>
                </div>

                <div className="inset-shadow-sm inset-shadow-[#1e1e1e] pt-16 pb-30 px-10 bg-[#000000] text-white text-start shadow-lg hover:shadow-xl shadow-[#1e1e1e] rounded-xl transition-transform duration-300 hover:scale-105">
                    <img 
                    src="/Trust.svg" 
                    alt="trust" 
                    className="w-14 h-14"/>
                    <h1 className="w-40 flex-wrap mt-4 text-[24px] font-bold">Make a Donation</h1>
                    <p className="mt-16 text-[16px] flex-wrap">Support a charity by donating cryptocurrency to help the cause that they are trying to raise awareness</p>
                </div>
            </div>

        </div>
    );
}