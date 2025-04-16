'use client';

import Navbar from '../../components/Navbar';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useReadContract,useAccount } from 'wagmi';
import abi from "../abi/abi.json";
import { ethers } from 'ethers';
import Link from 'next/link';
import Image from 'next/image';

export default function DonationHiistory() {
    const { id } = useParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { address } = useAccount();

    const { data: campaigns } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getAllCampaigns',
    });

    useEffect(() => {
        async function fetchDonations() {
            if (!address || !campaigns) return;
            
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(
                    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                    abi,
                    provider
                );

                // Filter donations by donor address
                const filter = contract.filters.DonationReceived();
                console.log(filter);
                const events = await contract.queryFilter(filter);
                console.log(events);

                 // Filter client-side for current address
                const userDonations = events.filter(event => 
                    event.args.donor.toLowerCase() === address.toLowerCase()
                );

                // Process events
                const donationsWithDetails = await Promise.all(
                    userDonations.map(async (event) => {
                        const campaign = campaigns.find(
                            c => c.id.toString() === event.args[0].toString()
                        );
                        
                        const block = await provider.getBlock(event.blockNumber);
                        
                        return {
                            campaignId: event.args[0],
                            amount: ethers.formatEther(event.args[2]),
                            txHash: event.transactionHash,
                            timestamp: new Date(block.timestamp * 1000),
                            campaignName: campaign?.name || "Unknown Campaign"
                        };
                    })
                );

                const sortedDonations = donationsWithDetails.sort((a, b) => b.timestamp - a.timestamp);

                setDonations(sortedDonations);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching donations:", error);
                setLoading(false);
            }
        }

        fetchDonations();
    }, [address, campaigns]);

    // 3. Filter donations based on search
    const filteredDonations = donations.filter(donation =>
        donation.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return(
        <div className="min-h-screen bg-black pb-0 md:pb-14">
            <Navbar />

            <div className='bg-black md:bg-[var(--dark-gray)] w-full md:w-[85%] pt-14 md:mt-16 flex flex-col mx-auto rounded-xl'>
                <div className='flex flex-col px-10 md:px-14'>
                    <h1 className='text-white text-2xl font-bold'>Donation History</h1> 
                    <p className='text-[#747474] text-[16px] font-semibold mt-4 md:mt-2'>Every donation you make will be recorded here</p>
                </div>

                <div className="md:w-[50%] min-w-[300px] bg-[var(--dark-gray)] justify-between border-2 border-[#1E1E1E] flex flex-row mt-8 px-6 mx-10 md:mx-14 py-2 rounded-lg">
                    <input 
                    type="search"
                    name="searchCampaigns" 
                    id="search" 
                    placeholder='Search Campaigns' 
                    className=" w-full border-none outline-none text-white text-[14px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        className=" cursor-pointer ml-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#747474]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
                        </svg>
                    </button>
                </div>

                <div className='overflow-x-auto'>
                    <div className="min-w-[800px]">
                        <div className='bg-black md:bg-[#1E1E1E] flex flex-row justify-between text-sm text-white mt-10 px-10 md:px-14  py-6 font-bold'>
                            <div className='min-w-[300px] text-left'>CAMPAIGN NAME</div>
                            <div className='min-w-[180px] text-left'>TRANSACTION HASH</div>
                            <div className='min-w-[100px] text-center'>AMOUNT</div>
                            <div className='min-w-[100px] text-center'>DATE</div>
                            <div className='min-w-[100px] text-center'>DETAILS</div>
                        </div>
                        {loading ? (
                            <p className="text-[#747474] text-center font-semibold py-6">Loading donation history...</p>
                        ) : filteredDonations.length === 0 ? (
                            <p className="text-[#747474] text-center font-semibold py-4">
                                {donations.length === 0 ? "No donations found" : "No matching donations"}
                            </p>
                        ) : (
                            filteredDonations.map((donation, index) => (
                                <div key={index} className='flex flex-row justify-between text-sm border-b border-[#1E1E1E] last-of-type:border-b-0 last-of-type:rounded-b-xl text-white px-10 lg:px-14 py-6 font-bold hover:bg-[#0E0E0E] whitespace-nowrap'>
                                    <div className='min-w-[300px] text-left'>{donation.campaignName}</div>
                                    <div className='min-w-[180px] text-left'>
                                        <Link 
                                            href={`https://sepolia.etherscan.io/tx/${donation.txHash}`}
                                            className="text-blue-500 font-medium cursor-pointer underline underline-offset-2 whitespace-nowrap"
                                        >
                                            {donation.txHash.slice(0, 15)}...{donation.txHash.slice(-5)}
                                        </Link>
                                    </div>
                                    <div className='min-w-[100px] text-center text-[#747474] whitespace-nowrap'>{donation.amount} ETH</div>
                                    <div className='min-w-[100px] text-center text-[#747474]'>
                                        {donation.timestamp.toLocaleDateString()}
                                    </div>
                                    <div className='min-w-[100px] text-center'>
                                        <Link
                                            href={`/donate/${donation.campaignId}`}
                                            className="cursor-pointer inline-block underline underline-offset-2"
                                        >
                                            <svg className='mx-auto border-b-[0.5px] border-blue-500' xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 576 512"><path fill="#2b7fff" d="M249.6 471.5c10.8 3.8 22.4-4.1 22.4-15.5l0-377.4c0-4.2-1.6-8.4-5-11C247.4 52 202.4 32 144 32C93.5 32 46.3 45.3 18.1 56.1C6.8 60.5 0 71.7 0 83.8L0 454.1c0 11.9 12.8 20.2 24.1 16.5C55.6 460.1 105.5 448 144 448c33.9 0 79 14 105.6 23.5zm76.8 0C353 462 398.1 448 432 448c38.5 0 88.4 12.1 119.9 22.6c11.3 3.8 24.1-4.6 24.1-16.5l0-370.3c0-12.1-6.8-23.3-18.1-27.6C529.7 45.3 482.5 32 432 32c-58.4 0-103.4 20-123 35.6c-3.3 2.6-5 6.8-5 11L304 456c0 11.4 11.7 19.3 22.4 15.5z"/></svg>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}