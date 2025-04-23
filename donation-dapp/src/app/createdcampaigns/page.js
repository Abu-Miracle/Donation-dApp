'use client';

import Navbar from '../../components/Navbar';
import "../globals.css";
import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import abi from "../abi/abi.json";
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import CampaignOptions from "../../components/CampaignOptions";
import EditCampaignModal from '../../components/EditCampaignModal';

export default function CreatedCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [editingCampaign, setEditingCampaign] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [deletingCampaign, setDeletingCampaign] = useState(null);
    const [showDeleteModal,  setShowDeleteModal]  = useState(false);

    const { address, isConnected } = useAccount();

    const { data: campaign, isLoading, isError } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getAllCampaigns',
    });

    const { writeContractAsync } = useWriteContract()

    useEffect(() => {
        if (campaign) {
            setCampaigns(campaign);
        }
    }, [campaign]);

    console.log(campaign);

    const handleEditClick = (campaign) => {
        setEditingCampaign(campaign);
        setShowEditModal(true);
    };

    function handleDeleteClick(campaign) {
        setDeletingCampaign(campaign);
        setShowDeleteModal(true);
    }

    // When user confirms deletion
    async function confirmDelete() {
        try {
        await writeContractAsync({
            abi,
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
            functionName: 'deleteCampaign',
            args: [deletingCampaign.id],
        })
        // remove it locally so the UI updates immediately:
        setCampaigns(cs => cs.filter(c => c.id !== deletingCampaign.id))
        } catch (e) {
        console.error("Failed to delete:", e)
        alert("Deletion failed")
        } finally {
        setShowDeleteModal(false)
        setDeletingCampaign(null)
        }
    }

    function cancelDelete() {
        setShowDeleteModal(false)
        setDeletingCampaign(null)
    }

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

    function truncateText(text, maxLength = 45) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function truncateTitle(text, maxLength = 27) {
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

            <div className="w-[50%] bg-[var(--dark-gray)] justify-between flex flex-row mx-auto mt-8 px-6 py-2 rounded-3xl">
                <input 
                type="search"
                name="searchCampaigns" 
                id="search" 
                placeholder='Search Campaigns' 
                className="text-[var(--light-gray)] w-full border-none outline-none text-[14px]"
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

            <div className="flex flex-start mt-8 px-4 md:px-10 border-b-[2px] mx-7 pb-2 md:pb-3 border-[#1E1E1E]">
                <button className='text-white text-sm md:text-[16px] font-bold'>
                    Created Campaigns
                </button>
            </div>

            {/* Display Filtered Campaigns */}
            {!isConnected && (<div className='flex flex-col'>
                <p className='text-white text-center absolute top-1/2 left-1/2 font-semibold transform -translate-x-1/2 -translate-y-1/2 mb-4'>Please connect an Ethereum wallet to view campaigns</p>
                <Image src="/loading.gif" alt="loading" width={30} height={30} className='absolute w-30 h-30 top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
            </div>)}
            {isLoading && isConnected && (
                <Image 
                src="/loading.gif"
                alt="Locked"
                width={30}
                height={30} 
                className='absolute w-50 h-50 top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                />
            )}
            {isConnected && isError && (<p className='text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>Error loading campaigns.</p>)}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 mt-8 px-10 pb-10">
                {filteredCampaigns.map((campaign) =>   (
                <div key={`${campaign.name}-${campaign.targetDate}`} className="bg-[var(--dark-gray)] rounded-xl ">
                    {/* Example Card */}
                    <div className='relative'>
                        {campaign.imageUrl ?
                        <img src={campaign.imageUrl} className="object-cover rounded-t-xl w-full h-52 mb-0" /> :
                        <div className="bg-gray-600 w-full rounded-t-xl h-52 mb-0"></div>
                        }

                        {(campaign.fundsReleased) ? (
                            <div className="absolute top-2 left-2 font-bold text-green-400 p-1 ">
                                Funded
                            </div>
                        ) : (campaign.status === 0) ? (
                            <div className="absolute top-0 left-0 w-full rounded-t-xl h-52 p-3 bg-black/50 font-bold text-amber-300">
                                Pending Approval
                            </div>
                        ) : (campaign.status === 1) ? (
                            <div className="absolute top-2 left-2 font-bold text-[var(--sblue)] p-1 ">
                                Open
                            </div>
                        ) : (
                            <div className="absolute top-0 left-0 w-full rounded-t-xl h-52 p-3 bg-black/50 font-bold text-red-500">
                                Rejected
                            </div>
                        )}
                    </div>

                    <div className='px-6 py-4'>
                        <div className='flex flex-row justify-between'>
                            <div className='mb-6'>
                                <h2 className="text-white text-xl font-bold">{truncateTitle(campaign.name)}</h2>
                                <p className="text-[#747474] text-[14px]">{truncateText(campaign.description)}</p>
                            </div>
                            {(campaign.status === 0) ? (
                                <CampaignOptions
                                    isApproved={campaign.approved}
                                    onEdit={() => handleEditClick(campaign)}
                                    onDelete={() => handleDeleteClick(campaign)}
                                    onViewDetails={() => onViewDetails(campaign)} 
                                />
                            ) : (
                                <></>
                            )}  
                        </div>

                        <div className='mb-6 flex flex-row justify-between items-center'>
                            <div>
                                <p className="text-white font-bold text-[18px]"> {ethers.formatEther(campaign.raisedAmount)} ETH</p>
                                <p className="text-[#747474] text-[14px]">Raised of {ethers.formatEther(campaign.targetAmount)} ETH</p>
                            </div>

                            <div className='flex flex-col items-center'>
                                {(daysLeft(campaign.targetDate) >= 0) ? 
                                    <>
                                        <p className="text-white font-bold text-[18px]">{daysLeft(campaign.targetDate)}</p>
                                        <p className="text-[#747474] text-[14px]">days left</p>
                                    </>
                                    :
                                    <p className="text-white font-normal text-[14px]">Date Passed</p>
                                }
                            </div>
                        </div>

                        <div className='flex flex-row justify-between items-center xl:flex-row xl:justify-between'>
                            <div className='flex flex-row'>
                                <div className='bg-gray-300 p-1 rounded-full mr-2 whitespace-nowrap hidden md:block'>
                                    <Image 
                                    src='/ethereum.svg'
                                    alt='eth'
                                    width={12}
                                    height={12}
                                    className='w-4 h-4'
                                    />
                                </div>
                                <div>
                                    <p className="text-[#747474] text-[14px]">
                                    by <span className='font-extrabold text-[14px]'> {truncateAddress(campaign.organization)}</span>
                                    </p>
                                </div>
                            </div>

                            
                            <Link href={`/donate/${campaign.id}`}>
                                <button className="text-[var(--sblue)] ml-3 md:mx-0 mt-2 text-[14px] whitespace-nowrap flex cursor-pointer">See <span className='hidden md:block mx-1'>full</span> details</button>
                            </Link>
                        </div>
                    </div>
                </div>
                ))}
            </div>

            {showEditModal && editingCampaign && (
            <EditCampaignModal 
                campaign={editingCampaign}
                onClose={() => {
                setShowEditModal(false);
                setEditingCampaign(null);
                }}
                onUpdate={(updatedCampaign) => {
                setCampaigns(campaigns.map(c => 
                    c.id === updatedCampaign.id ? updatedCampaign : c
                ));
                }}
            />
            )}

            {showDeleteModal && deletingCampaign && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-[var(--dark-gray)] p-6 rounded-lg space-y-4 w-80">
                    <h2 className="text-white text-lg font-bold">Confirm Deletion</h2>
                    <p className="text-[#ccc]">
                        Are you sure you want to delete “
                        <span className="font-semibold text-white">{deletingCampaign.name}</span>”?
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                        onClick={cancelDelete}
                        className="px-6 py-2 bg-[#555] hover:bg-[#696969] text-white cursor-pointer  rounded-lg font-medium"
                        >
                        Cancel
                        </button>
                        
                        <button
                        onClick={confirmDelete}
                        className="px-6 py-2 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-500 font-[550]"
                        >
                        Delete
                        </button>
                    </div>
                </div>
            </div>
            )}

        </div>
    );
}