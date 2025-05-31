'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBalance, useReadContract } from 'wagmi';
import abi from "../abi/abi.json";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminPage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    const isAdmin = isConnected && address?.toLowerCase() === adminAddress?.toLowerCase();
    const [searchQuery, setSearchQuery] = useState("");
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [campaigns, setCampaigns] = useState([]);
    const [selectedTab, setSelectedTab] = useState("open");

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    
    useEffect(() => {
        if (isConnected && !isAdmin) {
            // Redirect if connected user is not admin.
            router.replace('/');
        }
    }, [isConnected, isAdmin, router]);

    const { data: campaign, isLoading, isError } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getAllCampaigns',
    });

    // Contract balance
    const { data: contractBalance } = useBalance({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    });

    const { data: deletedCampaign } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getDeletedCampaigns',
    })

    useEffect(() => {
        const combined = [
            ...(campaign || []),
            ...(deletedCampaign || [])
        ];

        const uniqueCampaigns = combined.filter(
            (c, index, self) => 
            index === self.findIndex((t) => t.id === c.id)
        );
        
        setCampaigns(uniqueCampaigns);
    }, [campaign, deletedCampaign]);

    useEffect(() => {
        async function fetchAllDonations() {
            if (!campaigns) return;
            
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(
                    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                    abi,
                    provider
                );

                const filter = contract.filters.DonationReceived();
                const events = await contract.queryFilter(filter);

                const allDonations = await Promise.all(
                    events.map(async (event) => {
                        const campaign = campaigns.find(
                            c => c.id.toString() === event.args.campaignId.toString()
                        );
                        
                        const block = await provider.getBlock(event.blockNumber);
                        
                        return {
                            campaignId: event.args.campaignId,
                            donor: event.args.donor,
                            amount: ethers.formatEther(event.args.amount),
                            txHash: event.transactionHash,
                            timestamp: new Date(block.timestamp * 1000),
                            campaignName: campaign?.name || "Unknown Campaign"
                        };
                    })
                );

                const sortedDonations = allDonations.sort((a, b) => b.timestamp - a.timestamp);
                setDonations(sortedDonations);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching donations:", error);
                setLoading(false);
            }
        }

        fetchAllDonations();
    }, [campaigns]);

    const filteredDonations = donations.filter(donation =>
        donation.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredDonations.length / rowsPerPage);

    const paginatedDonations = filteredDonations.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Current timestamp (in seconds)
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const filteredCampaigns = campaigns.filter((campaign) => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (selectedTab === "deleted") {
            return campaign.isDeleted && matchesSearch;
        }
        if (selectedTab === "release") {
          return (
            campaign.approved === true &&
            campaign.fundsReleased === false &&
            Number(campaign.targetDate) <= currentTimestamp && 
            !campaign.isDeleted &&
            matchesSearch
          );
        } if (selectedTab === "rejected") {
            return campaign.status === 2 && !campaign.isDeleted && matchesSearch;
        } if (selectedTab === "open") {
            return campaign.approved === true && campaign.fundsReleased === false && daysLeft(campaign.targetDate) > 0 && !campaign.isDeleted && matchesSearch;
        } if (selectedTab === "closed") {
            return (campaign.approved === false && campaign.status === 0) && !campaign.isDeleted && matchesSearch;
        } if (selectedTab === "funded") {
            return campaign.fundsReleased === true && !campaign.isDeleted && matchesSearch;
        }  
        return false;
    });

    const pendingApprovals = campaign?.filter(c => c.status == 0).length || 0;
    const approvedCampaigns = campaign?.filter(c => c.approved && !c.fundsReleased).length || 0;
    const fundedCampaigns = campaign?.filter(c => c.fundsReleased).length || 0;
    // const totalCampaigns = (campaign?.length || 0) + (deletedCampaign?.length || 0);

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

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
            Access denied. Only admin can view this page.
            </div>
        );
    }

    return(
        <>

        <div className="min-h-screen bg-black pb-10">
            <Navbar />

            <h1 className="text-3xl mt-16 font-black text-center flex md:text-left text-white mx-30">Admin Dashboard</h1>
            
            <p className='mx-10 md:mx-30 mt-8 text-white flex flex-col'> 
                <span className="text-[18px] text-[#747474] font-semibold">Contract Balance</span>
                <span className='font-bold text-2xl mt-2'>
                {contractBalance ? 
                    `${parseFloat(ethers.formatEther(contractBalance.value)).toFixed(3)} ETH` : 
                    'Loading...'
                }
                </span>
            </p>

            <div className='mt-7 grid grid-cols-1 space-y-8 md:space-y-0  md:grid-cols-3 spaxe-x-0 md:space-x-6 px-10 md:px-30 '>
                <div className='bg-[var(--dark-gray)] flex flex-col px-6 py-8 space-y-4 border-l-4 border-[var(--bold-blue)]'>
                    <h1 className='font-semibold text-[18px] text-[#747474]'>Pending Approvals</h1>
                    <p className='font-bold text-3xl text-white'>{pendingApprovals}</p>
                </div>
                <div className='bg-[var(--dark-gray)] flex flex-col px-6 py-8 space-y-4 border-l-4 border-[var(--bold-blue)]'>
                    <h1 className='font-semibold text-[18px] text-[#747474]'>Approved Campaigns</h1>
                    <p className='font-bold text-3xl text-white'>{approvedCampaigns}</p>
                </div>
                <div className='bg-[var(--dark-gray)] flex flex-col px-6 py-8 space-y-4 border-l-4 border-[var(--bold-blue)]'>
                    <h1 className='font-semibold text-[18px] text-[#747474]'>Funded Campaigns</h1>
                    <p className='font-bold text-3xl text-white'>{fundedCampaigns}</p>
                </div>
            </div>

            <div className='bg-black md:bg-[var(--dark-gray)] w-full md:w-[85%] pt-14 md:mt-12 flex flex-col mx-auto rounded-xl mb-20'>
                    <div className='flex flex-col px-10 md:px-14'>
                        <h1 className='text-white text-2xl font-bold'>All Donation Transactions</h1> 
                        <p className='text-[#747474] text-[16px] font-semibold mt-4 md:mt-2'>
                            All donations across all campaigns are recorded here
                        </p>
                    </div>

                    <div className="md:w-[50%] min-w-[300px] bg-[var(--dark-gray)] justify-between border-2 border-[#1E1E1E] flex flex-row mt-8 px-6 mx-10 md:mx-14 py-2 rounded-lg">
                        <input 
                            type="search"
                            placeholder='Search Campaigns' 
                            className="w-full border-none outline-none text-white text-[14px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="cursor-pointer ml-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#747474]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
                            </svg>
                        </button>
                    </div>

                    <div id='editModal' className='overflow-x-auto overflow-y-auto mt-10 mb-4'>
                        <div className="min-w-[800px]">
                            <div className='bg-black md:bg-[#1E1E1E] flex flex-row justify-between text-sm text-white px-10 md:px-14 py-6 font-bold'>
                                <div className='min-w-[180px] text-left'>SENDER'S ADDRESS</div>
                                <div className='min-w-[350px] text-left'>CAMPAIGN NAME</div>
                                <div className='min-w-[180px] text-left'>TRANSACTION HASH</div>
                                <div className='min-w-[100px] text-center'>AMOUNT</div>
                                <div className='min-w-[100px] text-center'>DATE</div>
                            </div>
  
                            {loading ? (
                                <p className="text-[#747474] text-center font-semibold py-6">Loading donations...</p>
                            ) : paginatedDonations.length === 0 ? (
                                <p className="text-[#747474] text-center font-semibold py-4">
                                    {donations.length === 0 ? "No donations found" : "No matching donations"}
                                </p>
                            ) : (
                                paginatedDonations.map((donation, index) => (
                                    <div key={index} className='flex flex-row justify-between text-sm border-b border-[#1E1E1E] last-of-type:border-b-0 text-white px-10 lg:px-14 py-6 font-bold whitespace-nowrap'>
                                        <div className='min-w-[180px] text-left text-[#747474]'>
                                            {`${donation.donor.slice(0, 10)}...${donation.donor.slice(-4)}`}
                                        </div>
                                        <div className='min-w-[350px] text-left'>{donation.campaignName}</div>
                                        <div className='min-w-[180px] text-left'>
                                            <Link 
                                                href={`https://sepolia.etherscan.io/tx/${donation.txHash}`}
                                                className="text-blue-500 font-medium cursor-pointer underline underline-offset-2"
                                            >
                                                {donation.txHash.slice(0, 15)}...{donation.txHash.slice(-5)}
                                            </Link>
                                        </div>
                                        <div className='min-w-[100px] text-center text-[#747474]'>
                                            {donation.amount} ETH
                                        </div>
                                        <div className='min-w-[100px] text-center text-[#747474]'>
                                            {donation.timestamp.toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                            
                        </div>

                        <div className="flex justify-end items-center mt-4 space-x-4 pb-4 mr-5">
                            <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 bg-[#1E1E1E] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#2E2E2E]"
                            >
                            Previous
                            </button>
                            
                            <span className="text-white text-sm">
                            Page {currentPage} of {totalPages}
                            </span>

                            <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 bg-[#1E1E1E] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#2E2E2E]"
                            >
                            Next
                            </button>
                        </div>
                    </div>
            </div>

            <div className="w-[50%] bg-[var(--dark-gray)] justify-between min-w-[300px] flex flex-row mx-auto mt-8 px-6 py-2 rounded-3xl">
                <input 
                type="search"
                name="searchCampaigns" 
                id="search" 
                placeholder='Search Campaigns' 
                className="text-[var(--light-gray)] w-full border-none outline-none text-[16px]"
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

            <div className='relative'>
                <div id='editModal' className="overflow-x-auto">
                    <div className="flex flex-start min-w-[960px] space-x-6 mt-8 px-14 pb-3 md:pb-7 -mx-7 md:mx-7">
                        <button
                            className={selectedTab === "open" 
                                ? "bg-white text-black whitespace-nowrap text-sm font-[600] px-4 py-2 rounded-xl cursor-pointer" 
                                : "bg-[#1E1E1E] whitespace-nowrap font-[600] md:font-medium hover:bg-[#585858] text-white px-4 py-2 rounded-xl text-sm cursor-pointer"}
                            onClick={() => setSelectedTab("open")}
                        >
                            Open Campaigns
                        </button>
                        <button
                            className={selectedTab === "closed" 
                                ? "bg-white text-black whitespace-nowrap text-sm font-[600] px-4 py-2 rounded-xl cursor-pointer" 
                                : "bg-[#1E1E1E] whitespace-nowrap font-[600] md:font-medium hover:bg-[#585858] text-white px-4 py-2 rounded-xl text-sm cursor-pointer"}
                            onClick={() => setSelectedTab("closed")}
                        >
                            Closed Campaigns
                        </button>
                        <button
                            className={selectedTab === "release" 
                                ? "bg-white text-black whitespace-nowrap text-sm font-[600] px-4 py-2 rounded-xl cursor-pointer" 
                                : "bg-[#1E1E1E] whitespace-nowrap font-[600] md:font-medium hover:bg-[#585858] text-white px-4 py-2 rounded-xl text-sm cursor-pointer"}
                            onClick={() => setSelectedTab("release")}
                        >
                            Due for fund release 
                        </button>
                        <button
                            className={selectedTab === "rejected" 
                                ? "bg-white text-black whitespace-nowrap text-sm font-[600] px-4 py-2 rounded-xl cursor-pointer" 
                                : "bg-[#1E1E1E] whitespace-nowrap font-[600] md:font-medium hover:bg-[#585858] text-white px-4 py-2 rounded-xl text-sm cursor-pointer"}
                            onClick={() => setSelectedTab("rejected")}
                        >
                            Rejected Campaigns
                        </button>
                        <button
                            className={selectedTab === "funded" 
                                ? "bg-white text-black whitespace-nowrap text-sm font-[600] px-4 py-2 rounded-xl cursor-pointer" 
                                : "bg-[#1E1E1E] whitespace-nowrap font-[600] md:font-medium hover:bg-[#585858] text-white px-4 py-2 rounded-xl text-sm cursor-pointer"}
                            onClick={() => setSelectedTab("funded")}
                        >
                            Funded Campaigns
                        </button>
                        <button
                            className={selectedTab === "deleted" 
                                ? "bg-white text-black whitespace-nowrap text-sm font-[600] px-4 py-2 rounded-xl cursor-pointer" 
                                : "bg-[#1E1E1E] whitespace-nowrap font-[600] md:font-medium hover:bg-[#585858] text-white px-4 py-2 rounded-xl text-sm cursor-pointer"}
                            onClick={() => setSelectedTab("deleted")}
                        >
                            Deleted Campaigns
                        </button>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-b border-[#1E1E1E]"></div>
            </div>

            {/* Display Filtered Campaigns */}
            <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-10 mt-8 px-10 pb-10">
                {!isConnected && (
                    <div className='flex flex-col'>
                        <Image src="/loading.gif" alt="loading" width={30} height={30} className='absolute w-30 h-30 top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
                    </div>
                )}
                {isLoading && isConnected && (
                    <Image 
                    src="/loading.gif"
                    alt="Locked"
                    width={30}
                    height={30} 
                    className='absolute w-30 h-30 top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                    />
                )}
                {isConnected && isError && (<p className='text-white text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>Error loading campaigns.</p>)}

                {filteredCampaigns.map((campaign) =>  (
                <div key={`${campaign.name}-${campaign.targetDate}`} className="bg-[var(--dark-gray)] rounded-xl ">
                    {/* Example Card */}
                    <div className=''>
                        {campaign.imageUrl ?
                        <img src={campaign.imageUrl} className="object-cover rounded-t-xl w-full h-52 mb-0" /> :
                        <div className="bg-slate-500 w-full rounded-t-xl h-52 mb-0"></div>
                        }
                    </div>

                    <div className='px-6 py-4'>
                        <div className='flex justify-between items-center'>
                            <div className='mb-6'>
                                <h2 className="text-white text-xl font-bold">{truncateTitle(campaign.name)}</h2>
                                <p className="text-[#747474] text-[14px]">{truncateText(campaign.description)}</p>
                            </div>

                            <div className='mb-6'>
                                {campaign.approved ? 
                                 <> </>
                                    :
                                <Image
                                    src="/locked.svg"
                                    alt="Locked"
                                    width={20}
                                    height={20} 
                                    className='mr-3'
                                /> 
                                }
                            </div>
                        </div>

                        <div className='mb-6 flex flex-row justify-between items-center'>
                            {campaign.fundsReleased ? 
                            <>
                             <div>
                                <p className="text-white text-[16px] font-bold">Campaign Funded</p>
                            </div>
                             <div className='flex flex-col items-center'>
                                <p className="text-white font-bold text-[18px]">--</p>
                                <p className="text-[#747474] text-[14px]">days left</p>
                            </div>
                            </>
                            :
                            <>
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
                            </>
                            }
                        </div>

                        <div className='flex flex-row justify-between items-center'>
                            <div className='flex flex-row'>
                                <div className='bg-gray-300 p-1 rounded-full mr-2 hidden md:block'>
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
                            
                            {campaign.isDeleted 
                            ? <p className='text-red-600 font-bold'>Deleted</p>
                            : <Link href={`/donate/${campaign.id}`}>
                                <button className="text-[var(--sblue)] ml-3 md:mx-0 mt-2 text-[14px] whitespace-nowrap flex cursor-pointer">See <span className='hidden md:block mx-1'>full</span> details</button>
                            </Link>}
                        </div>
                    </div>
                </div>
                ))}
            </div>

           
        </div>

        <Footer />
        </>
    );
}