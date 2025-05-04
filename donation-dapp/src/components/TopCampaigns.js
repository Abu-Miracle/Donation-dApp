'use client'

import { useReadContract, useAccount } from 'wagmi';
import abi from "../app/abi/abi.json";
import { ethers } from 'ethers';
import { useMemo } from 'react';
import Link from "next/link";

export default function TopCampaigns() {
    const { data: allCampaigns, isLoading, isError } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getAllCampaigns',
    })
    const { address, isConnected } = useAccount();

    const topThree = useMemo(() => {
        if (!allCampaigns) return []
        return [...allCampaigns]
          .filter(c => c.approved && !c.isDeleted)
          .sort(
            (a, b) =>
              Number(ethers.formatEther(b.raisedAmount)) -
              Number(ethers.formatEther(a.raisedAmount))
          )
          .slice(0, 3)
    }, [allCampaigns])


    return(
        <div className="md:min-h-[70vh] bg-[var(--bold-blue)] py-10 relative">
            <h1 className="font-black text-white text-3xl mb-6 md:mb-8 px-10">Our Top Campaigns</h1>

            {!isConnected && (<div className='absolute inset-0 flex items-center justify-center bg-black/50 z-10'>
                <p className='text-white text-lg font-semibold text-center'>Please connect an Ethereum wallet to view our top campaigns</p>
            </div>)}

            {isLoading && isConnected && (<div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <p className="text-white text-lg font-semibold text-center">
                   Loading Campaigns...
                </p>
            </div>)}

            {isError && isConnected && (<div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <p className="text-white text-lg font-semibold text-center">
                    Error Loading Campaigns
                </p>
            </div>)}

            <div>
                <div id="editModal" className="overflow-x-auto mx-10">
                    <div className="min-w-[800px] flex flex-row space-x-8 items-center">

                    {topThree.map((camp) => {
                    const raised = ethers.formatEther(camp.raisedAmount)
                    const target = ethers.formatEther(camp.targetAmount)
                    return (
                        <div
                            key={camp.id.toString()}
                            className="group relative overflow-hidden rounded-xl shadow-lg w-[500px] md:min-w-[500px] h-96 md:h-75" 
                        >
                            <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110 rounded-xl"
                            style={{
                                backgroundImage: `url(${camp.imageUrl || ''})`,
                            }}
                            />

                            <div className="w-full h-full bg-gradient-to-b from-black/75 via-transparent via-35% to-black flex flex-col items-start justify-end px-4 md:px-6 pb-4 relative z-10">
                                <div className="absolute top-0 left-0 flex justify-between px-4 md:px-6 py-4 w-full">
                                    <div>
                                    <p className="text-white font-bold text-[18px]">
                                        {raised} ETH
                                    </p>
                                    <p className="text-[#c0c0c0] text-sm font-bold">
                                        Raised of{' '}
                                        <span className="text-white text-[15px]">
                                        {target} ETH
                                        </span>
                                    </p>
                                    </div>

                                    <div>
                                    <Link href={`/donate/${camp.id}`}>
                                        <button className="bg-[var(--sblue)] text-black rounded-full text-sm py-1 px-4 md:px-6 hover:bg-[var(--light-blue)] font-black cursor-pointer">
                                        Donate
                                        </button>
                                    </Link>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-lg font-bold text-white">
                                    {camp.name}
                                    </p>
                                    <p className="text-sm text-[#c0c0c0]">
                                    {camp.description.length > 100
                                        ? camp.description.slice(0, 100) + '…'
                                        : camp.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                    })}
                    </div>
                </div>
                
                {isConnected 
                ? <div className="flex justify-end">
                    <Link href="/donate" className='mt-4 text-white font-medium underline underline-offset-2 font-sans px-10'>
                        Browse More
                    </Link>
                </div>
                : <></>}
            </div>
        </div>
    );
}