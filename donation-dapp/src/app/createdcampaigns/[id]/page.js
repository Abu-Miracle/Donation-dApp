'use client';

import Navbar from '../../../components/Navbar';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import abi from "../../abi/abi.json";
import { ethers } from 'ethers';
import Image from 'next/image';

export default function DetailsPage () {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);

    const { data: campaigns, isLoading, isError } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getAllCampaigns',
    });

    const { data: donorsAndAmounts, isLoading: loadingDonors, isError: errorDonors  } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getDonorsAndAmounts',
        args: [parseInt(id)],
    });

    const donorCount = donorsAndAmounts ? donorsAndAmounts[0] : [];
    const numberOfDonors = donorCount.length;

    console.log("Donors X Amts: ", donorsAndAmounts);
    console.log("Donor Count: ", numberOfDonors);
    
    useEffect(() => {
        if (campaigns && Array.isArray(campaigns)) {
            console.log("Campaigns:", campaigns);
            const selectedCampaign = campaigns.find(
                (c) => c.id?.toString() === id 
            );
            setCampaign(selectedCampaign);
        }
    }, [campaigns, id]);

    function daysLeft(date) {
        // Get the current time in seconds
        const nowInSeconds = Math.floor(Date.now() / 1000); 
        // Calculate the difference in seconds
        const diffInSeconds = Number(date) - nowInSeconds;
        // Convert seconds to days (1 day = 86400 seconds)
        const daysLeft = Math.ceil(diffInSeconds / 86400);
        return daysLeft.toString();
    }

    function truncateAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 10)}...${address.substring(address.length - 4)}`;
    }

    const [donors, amounts] = donorsAndAmounts || [];

    if (!campaign) return <div className='min-h-screen bg-black'></div>;

    return(
        <div className='min-h-screen bg-black'>
            <Navbar />

            
            {isLoading && <p className='text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>Loading campaigns...</p>}
            {isError && <p className='text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>Error loading campaigns.</p>}
            <div className='flex flex-col justify-center items-center mt-16 px-10 lg:px-0 pb-20'>
                <div className='flex flex-col'>
                    <div className='flex flex-row gap-10'> 
                        <div>
                            {campaign.imageUrl ? 
                            <img src={campaign.imageUrl} className='object-cover rounded-xl w-[65vw] h-[500px]' /> : 
                            <div className='bg-slate-500'></div>
                            }
                        </div>
                        
                        <div className='flex flex-col justify-between text-center'>
                            <div className='w-36 aspect-square'>
                                <div className='bg-[#0E0E0E] text-white mb-0 h-[60%] flex justify-center items-center px-4 py-4 font-bold text-2xl rounded-t-xl'>{daysLeft(campaign.targetDate)}</div>
                                <div className='bg-[#1E1E1E] text-lg text-[#747474] font-bold w-full h-[40%] flex justify-center items-center rounded-b-xl'>Days left</div>
                            </div>
                            <div className=' w-36 aspect-square'>
                                <div className='bg-[#0E0E0E] text-white mb-0 h-[60%] flex justify-center items-center px-4 py-4 font-bold text-2xl rounded-t-xl'>{ethers.formatEther(campaign.raisedAmount)}</div>
                                <div className='bg-[#1E1E1E] text-lg text-[#747474] font-bold w-full h-[40%] flex justify-center items-center rounded-b-xl'>{`Raised of ${ethers.formatEther(campaign.targetAmount)}`}</div>
                            </div>
                            <div className='w-36 aspect-square'>
                                <div className='bg-[#0E0E0E] text-white mb-0 h-[60%] flex justify-center items-center px-4 py-4 font-bold text-2xl rounded-t-xl'>{numberOfDonors}</div>
                                <div className='bg-[#1E1E1E] text-lg text-[#747474] font-bold w-full h-[40%] flex justify-center items-center rounded-b-xl'>Donors</div>
                            </div>
                        </div>
                    </div>

                    <h1 className='text-white text-4xl font-bold mt-6'>{campaign.name}</h1>
                </div>

                <div className='flex flex-col lg:flex-row justify-between w-full px-10 lg:px-56 mt-16'>
                    <div className='flex flex-col'>
                        <div className='flex flex-col'>
                            <h1 className='text-white font-bold mb-2 text-xl'>CREATOR</h1>
                            <div className='flex flex-row'>
                                <div className='bg-gray-300 p-1 rounded-full mr-2'>
                                    <Image 
                                    src='/ethereum.svg'
                                    alt='eth'
                                    width={20}
                                    height={20}
                                    />
                                </div>
                                <div className='text-[#747474] text-lg'>{campaign.organization}</div>
                            </div>
                        </div>

                        <div className='flex flex-col mt-10'>
                            <div className='text-white font-bold mb-2 text-xl'>STORY</div>
                            <div className='text-[#747474] text-lg'>{campaign.description}</div>
                        </div>

                        <div className='flex flex-col mt-10'>
                            <div className='text-white font-bold mb-2 text-xl table-auto"'>DONORS</div>
                        </div>

                        <div className='flex flex-col text-white w-[35vw]'>
                            <div className='flex flex-row w-full'>
                                <div className='w-[20%] text-left'>S/N</div>
                                <div className='w-[80%] text-left'>Donor Address</div>
                                <div className='w-[50%] text-left'>Amount</div>
                            </div>

                            {donors?.map((donor, index) => (
                            <div key={donor} className="flex flex-row w-full">
                                <div className='w-[20%] text-left'>{index + 1}</div>
                                <div className='w-[80%] text-left'>{truncateAddress(donor)}</div>
                                <div className='w-[50%] text-left'>{ethers.formatEther(amounts[index])}</div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}