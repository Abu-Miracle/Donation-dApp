export default function AboutUs() {
    return(
        <div id="about" className="min-h-[90vh] bg-black px-10 md:px-30 pt-10 pb-20 flex items-center justify-center border-none">
            <div className="flex md:flex-row flex-col w-full h-full min-h-[400px] lg:h-[460px] shadow-lg shadow-[#0e0e0e] rounded-3xl transition-transform duration-300 hover:scale-102 mb-10 md:border-none border border-[#1e1e1e]">
                
                <div className="w-full md:w-[50%] h-[300px] md:h-auto relative overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none group">
                    <div className="absolute inset-0 bg-[url('/stock1.jpg')] bg-cover bg-top transition-transform duration-300 ease-in-out group-hover:scale-110">
                        <div className="w-full h-full bg-gradient-to-b from-black/20 to-black/80 flex items-center px-10">
                            <h2 className="text-[32px] md:text-[42px] font-black text-white relative z-10">
                                ABOUT US
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="bg-black w-full md:w-[50%] md:inset-shadow-sm md:inset-shadow-[#1e1e1e] rounded-b-3xl md:rounded-r-3xl py-10 md:py-14 px-5 md:px-10 font-medium text-white shadow-lg md:rounded-bl-none text-md md:text-lg md:shadow-none flex flex-col items-center">
                    <div className="text-justify">
                        <p className="mb-2"> 
                            At BlockFund, we are revolutionizing charitable giving by harnessing the transparency, security, and global reach of blockchain technology. Our platform empowers individuals and organizations to create, fund, and manage impactful campaigns, everything from urgent relief efforts to long-term community projects.
                        </p>
                        <p>
                            With on-chain accountability, every donation is traceable and verifiable, ensuring that contributors can see exactly how their support is making a difference. BlockFund enables more efficient distribution of funds, greater donor confidence, and faster response times
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}