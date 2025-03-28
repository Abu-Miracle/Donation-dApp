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

    console.log("Donors X Amts: ", donorsAndAmounts);
    
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

    if (!campaign) return <p>No campaign found with ID: {id}</p>;

    return(
        <div className='min-h-screen bg-black'>
            <Navbar />

            
            {campaign.id && <p className='text-white'>No campaign found with ID: {id}</p>}
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
                                <div className='bg-[#0E0E0E] text-white mb-0 h-[60%] flex justify-center items-center px-4 py-4 font-bold text-2xl rounded-t-xl'>--</div>
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

                        <table className="table-fixed flex flex-wrap text-white">
                            <thead>
                                <tr className='flex items-center justify-between mt-5 gap-20 w-[25vw]'>
                                    <th>S/N</th>
                                    <th>Donor Address</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donors?.map((donor, index) => (
                                <tr key={donor} className="flex items-center justify-between gap-20 w-[25vw]">
                                    <td>{index + 1}</td>
                                    <td>{truncateAddress(donor)}</td>
                                    <td>{ethers.formatEther(amounts[index])}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='lg:mt-0 mt-8'>
                        <h1 className='text-white font-bold mb-4 text-xl'>FUND CAMPAIGN</h1>
                        <form action="" method="" className='px-8 py-12 flex flex-col bg-[#0E0E0E] rounded-xl justify-center items-center w-full lg:w-[25vw] gap-10'>
                            <p className='text-[#747474] text-xl'>Enter the amount that you would want to support this campaign with</p>
                            <input 
                            type="number" 
                            name="amount" 
                            id="amount" 
                            placeholder="Amount in ETH"
                            className='bg-[#0E0E0E] border-2 border-[#747474] py-5 px-3 text-[#747474] w-full'
                            />
                            <button type="submit" className='w-full font-bold rounded-2xl bg-[var(--sblue)] text-black p-3 text-xl font bold cursor-pointer hover:bg-[var(--bold-blue)]'>Donate</button>
                        </form>
                    </div>
                </div>
                
            </div>
        </div>
    );
}