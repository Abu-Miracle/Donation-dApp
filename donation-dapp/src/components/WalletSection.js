import Link from "next/link";

export default function WalletSection() {
    return(
        <div className="bg-gray-200 text-white py-10 px-10 md:px-20">
            <div className="mx-auto text-center text-black">

                <h2 className="text-3xl font-bold mb-2">Create Your Wallet to Join the Movement</h2>
                <h2 className="text-lg font-medium mb-8">
                    A secure Ethereum wallet is essential to fully interact with our platform
                </h2>

                <div className="w-full flex md:flex-row flex-col justify-center bg-gray-300 rounded-2xl">

                    <div className="bg-[url('/metamask.png')] bg-cover bg-center w-full md:w-[50%] h-64 md:h-auto rounded-2xl" />

                    <div className="px-5 py-10 md:px-10 w-full md:w-[50%] text-justify gap-1 flex flex-col relative z-10">
                        <h2 className="font-semibold text-[18px]">What is an Ethereum wallet?</h2>
                        <p className="mb-2">
                            Ethereum wallets hold your private keys and sign transactions, enabling you to safely call smart contracts and manage tokens without exposing sensitive data
                        </p>
                        <h2 className="font-semibold text-[18px]">Why we recommend Metamask</h2>
                        <p>
                            We recommend MetaMask because it balances ease of use for newcomers with advanced settings for experienced users
                        </p>
                        <p>
                            MetaMask is the most widely adopted browser extension and mobile wallet for Ethereum, with over 21 million monthly active users and seamless integration with thousands of dApps. 
                        </p>

                        <Link href="https://metamask.io/download.html">
                            <button  
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block cursor-pointer bg-[#F6851B] hover:bg-[#E2761B] text-black font-semibold py-3 px-6 mt-3 rounded-lg transition"
                            >
                            Download MetaMask
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}