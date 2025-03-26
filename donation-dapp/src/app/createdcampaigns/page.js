'use client';

import Navbar from '../../components/Navbar';
import "../globals.css";
import { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import abi from "../abi/abi..json";
import { ethers } from 'ethers';
import Image from 'next/image';
import CampaignOptions from "../../components/CampaignOptions";

export default function CreatedCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const { address, isConnected } = useAccount();

    const { data: campaign, isLoading, isError } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getAllCampaigns',
    });
    
    useEffect(() => {
        if (campaign) {
            setCampaigns(campaign);
        }
    }, [campaign]);

    console.log(campaign);

    const filteredCampaigns = campaigns.filter((campaign) => {
        // Check if the campaign was created by the connected address.
        const isCreatedByUser =
        address && campaign.organization.toLowerCase() === address.toLowerCase();
            
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
        return isCreatedByUser && matchesSearch;
    });

    function truncateAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 10)}...${address.substring(address.length - 4)}`;
    }

    function truncateText(text, maxLength = 50) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function truncateTitle(text, maxLength = 30) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Days Left
    function daysLeft(date) {
        // Get the current time in seconds
        const nowInSeconds = Math.floor(Date.now() / 1000); 
        // Calculate the difference in seconds
        const diffInSeconds = Number(date) - nowInSeconds;
        // Convert seconds to days (1 day = 86400 seconds)
        const daysLeft = Math.ceil(diffInSeconds / 86400);
        return daysLeft.toString();
    }


    return(
        <div className="min-h-screen bg-black">
            <Navbar />

            <div className="w-[60%] bg-[var(--dark-gray)] justify-between flex flex-row mx-auto mt-8 px-8 py-4 rounded-3xl">
                <input 
                type="search"
                name="searchCampaigns" 
                id="search" 
                placeholder='Search Campaigns' 
                className="text-[var(--light-gray)] w-full border-none outline-none text-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                 />
                <button 
                    type="submit" 
                    className=" cursor-pointer ml-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#747474]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
                    </svg>
                </button>
            </div>

            <div className="flex flex-start mt-8 px-10">
                <button className='text-white text-xl font-extrabold'>
                    Created Campaigns
                </button>
            </div>

            {/* Display Filtered Campaigns */}
            {isLoading && <p className='text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>Loading campaigns...</p>}
            {isError && <p className='text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>Error loading campaigns.</p>}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8 px-10">
                {filteredCampaigns.map((campaign) =>   (
                <div key={`${campaign.name}-${campaign.targetDate}`} className="bg-[var(--dark-gray)] rounded-xl ">
                    {/* Example Card */}
                    <div className=''>
                        {campaign.imageUrl ?
                        <img src={campaign.imageUrl} className="object-cover rounded-t-xl w-full h-60 mb-0" /> :
                        <div className="bg-slate-500 w-full rounded-t-xl h-60 mb-0"></div>
                        }
                    </div>

                    <div className='px-8 py-6'>
                        <div className='flex flex-row justify-between'>
                            <div className='mb-6'>
                                <h2 className="text-white text-2xl font-bold">{truncateTitle(campaign.name)}</h2>
                                <p className="text-[#747474]">{truncateText(campaign.description)}</p>
                            </div>
                            <CampaignOptions
                                isApproved={campaign.approved}
                                onEdit={() => onEdit(campaign)}
                                onDelete={() => onDelete(campaign)}
                                onViewDetails={() => onViewDetails(campaign)} 
                            />
                        </div>

                        <div className='mb-6 flex flex-row justify-between items-center'>
                            <div>
                                <p className="text-white font-bold text-[22px]"> {ethers.formatEther(campaign.raisedAmount)} ETH</p>
                                <p className="text-[#747474]">Raised of {ethers.formatEther(campaign.targetAmount)} ETH</p>
                            </div>

                            <div className='flex flex-col items-center'>
                                <p className="text-white font-bold text-[22px]">{daysLeft(campaign.targetDate)}</p>
                                <p className="text-[#747474]">days left</p>
                            </div>
                        </div>

                        <div className='flex flex-row items-center justify-between'>
                            <p className="text-[#747474]">
                            by <span className='font-extrabold'> {truncateAddress(campaign.organization)}</span>
                            </p>

                            {campaign.approved ? <button className="text-[var(--sblue)] mt-2 cursor-pointer">See full details</button> :
                            <Image
                                src="/locked.svg"
                                alt="Locked"
                                width={20}
                                height={20}
                                className='text-white'
                            /> 
                            }
                        </div>
                    </div>
                </div>
                ))}
            </div>

        </div>
    );
}