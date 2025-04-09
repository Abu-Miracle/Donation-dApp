'use client';

import Navbar from '../../../components/Navbar';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import abi from "../../abi/abi.json";
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import { Modal } from "../../../components/Modal";

// BASE - https://base-sepolia.blockscout.com/tx/
// OR - https://sepolia.basescan.org/tx/
// SEPOLIA - https://sepolia.etherscan.io/tx/

export default function DetailsPage () {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [donationAmount, setDonationAmount] = useState("");
    const [txHash, setTxHash] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [donationEvents, setDonationEvents] = useState([]);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    
    const { address, isConnected } = useAccount();
    const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    const isAdmin = isConnected && address?.toLowerCase() === adminAddress?.toLowerCase();

    const { data: campaigns, isLoading, isError } = useReadContract({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'getAllCampaigns',
    });
    
    console.log( campaigns);
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

    const { writeContractAsync } = useWriteContract();

    useEffect(() => {
        if (campaigns && Array.isArray(campaigns)) {
            console.log("Campaigns:", campaigns);
            const selectedCampaign = campaigns.find(
                (c) => c.id?.toString() === id 
            );
            setCampaign(selectedCampaign);
        }
    }, [campaigns, id]);

    const handleClose = () => {
        setIsModalOpen(false);
        setIsApproving(false); // If you have approval state
        setIsRejecting(false);
        setTxHash(null); // Optional: reset transaction hash
    };

    useEffect(() => {
        async function fetchDonationEvents() {
          if (!id) return;
          try {
            // Create a provider (using window.ethereum or your configured provider)
            const provider = new ethers.BrowserProvider(window.ethereum);
            //const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
            // Create the contract instance
            const contract = new ethers.Contract(
              process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
              abi,
              provider
            );
            // Create a filter for DonationReceived events for this campaign id.
            // Assuming the event signature is DonationReceived(uint _campaignId, address donor, uint value)
            //const DEPLOYMENT_BLOCK = 24053149;
            const filter = contract.filters.DonationReceived(parseInt(id));
            const events = await contract.queryFilter(filter);
            // const events = await contract.queryFilter(filter, DEPLOYMENT_BLOCK, 'latest');
            setDonationEvents(events);
          } catch (error) {
            console.error("Error fetching donation events:", error);
          }
        }
        fetchDonationEvents();
      }, [id]);

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

    const handleRejectConfirmation = () => {
        setIsRejectModalOpen(true);
    };
      
    const handleReject = async () => {
        setIsRejectModalOpen(false);
        setIsRejecting(true);
        setIsModalOpen(true);
        
        try {
          const result = await writeContractAsync({
            abi,
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
            functionName: 'rejectCampaign',
            args: [parseInt(id), ""],
          });
          
          setTxHash(result);
          console.log("Rejection transaction sent:", result);
          
        } catch (error) {
          console.error("Error rejecting campaign:", error);
          setIsRejecting(false);
          setIsModalOpen(false);
        }
    };

    const [donors, amounts] = donorsAndAmounts || [];

    const handleApproveConfirmation = () => {
        setIsConfirmModalOpen(true);
    };

    const handleApprove = async () => {
        setIsConfirmModalOpen(false);
        setIsApproving(true);
        setIsModalOpen(true);
        
        try {
          const result = await writeContractAsync({
            abi,
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
            functionName: 'approveCampaign', // Verify your contract's function name
            args: [parseInt(id)],
          });
          
          setTxHash(result);
          console.log("Approval transaction sent:", result);
          
        } catch (error) {
          console.error("Error approving campaign:", error);
          setIsApproving(false);
          setIsModalOpen(false);
        }
      };

    const handleDonate = async (e) => {
        e.preventDefault();
        try {
            // Trigger the modal to show processing
            setIsModalOpen(true);
          
             // Prepare the amount in wei
             const amountInWei = ethers.parseEther(donationAmount);
          
            // Call the contract donate function
            const result = await writeContractAsync({
                abi,
                address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                functionName: 'donate',
                args: [parseInt(id)], 
                value: amountInWei,
            });
            
            console.log("Transaction sent:", result);
            setTxHash(result);

            
        } catch (error) {
            console.error("Error making donation:", error);
            setIsModalOpen(false);
        }
      };

    if (!campaign) return <div className='min-h-screen w-full text-white bg-black text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>No campaign found with ID: {id}</div>;

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
                            <img src={campaign.imageUrl} className='object-cover rounded-xl w-[65vw] h-[400px]' /> : 
                            <div className='bg-slate-500 w-[65vw] h-[400px] rounded-xl'></div>
                            }
                        </div>
                        
                        <div className='flex flex-col justify-between text-center'>
                            <div className='w-28 aspect-square'>
                                <div className='bg-[#0E0E0E] text-white mb-0 h-[60%] flex justify-center items-center px-4 py-4 font-bold text-2xl rounded-t-xl'>{daysLeft(campaign.targetDate)}</div>
                                <div className='bg-[#1E1E1E] text-sm text-[#747474] font-semibold w-full h-[40%] flex justify-center items-center rounded-b-xl'>Days left</div>
                            </div>
                            <div className=' w-28 aspect-square'>
                                <div className='bg-[#0E0E0E] text-white mb-0 h-[60%] flex justify-center items-center px-4 py-4 font-bold text-2xl rounded-t-xl'>{ethers.formatEther(campaign.raisedAmount)}</div>
                                <div className='bg-[#1E1E1E] text-sm text-[#747474] font-semibold w-full h-[40%] flex justify-center items-center rounded-b-xl'>{`Raised of ${ethers.formatEther(campaign.targetAmount)}`}</div>
                            </div>
                            <div className='w-28 aspect-square'>
                                <div className='bg-[#0E0E0E] text-white mb-0 h-[60%] flex justify-center items-center px-4 py-4 font-bold text-2xl rounded-t-xl'>{numberOfDonors}</div>
                                <div className='bg-[#1E1E1E] text-sm text-[#747474] font-semibold w-full h-[40%] flex justify-center items-center rounded-b-xl'>Donors</div>
                            </div>
                        </div>
                    </div>

                    <h1 className='text-white text-3xl font-bold mt-6'>{campaign.name}</h1>
                </div>

                <div className='flex flex-col lg:flex-row justify-between w-full px-10 lg:px-30 xl:px-40 mt-16'>
                    <div className='flex flex-col lg:mr-5'>
                        <div className='flex flex-col'>
                            <h1 className='text-white font-bold mb-2 text-lg'>CREATOR</h1>
                            <div className='flex flex-row'>
                                <div className='bg-gray-300 p-1 rounded-full mr-2'>
                                    <Image 
                                    src='/ethereum.svg'
                                    alt='eth'
                                    width={20}
                                    height={20}
                                    />
                                </div>
                                <div className='text-[#747474] text-sm'>{campaign.organization}</div>
                            </div>
                        </div>

                        <div className='flex flex-col mt-10'>
                            <div className='text-white font-bold mb-2 text-lg'>STORY</div>
                            <div className='text-[#747474] text-sm'>{campaign.description}</div>
                        </div>
                            
                        {campaign.approved ? 
                        <>
                        <div className='flex flex-col mt-10'>
                            <div className='text-white font-bold mb-4 text-lg'>DONORS</div>
                        </div>
                        <div className='flex flex-col text-white w-full lg:w-[45vw] bg-[#0E0E0E] pt-6 pb-4 px-5 rounded-2xl font-bold'>
                            <div className='flex flex-row w-full justify-between pb-4 mb-4 border-b-[1px] border-[#747474] border-opacity-100'>
                                <div className='w-[20%] text-left'>S/N</div>
                                <div className='w-[80%] text-left'>Donor Address</div>
                                <div className='w-[80%] text-left'>Tx Hash</div>
                                <div className='w-[30%] text-left'>Amount</div>
                            </div>

                            {numberOfDonors === 0 ? (
                                <div className="text-[#747474] text-center py-4">
                                    No donors have donated to this campaign yet
                                </div>
                            ) : (
                                donationEvents.map((event, index) => {
                                    const { donor, amount } = event.args;
                                    const formattedAmount = ethers.formatEther(amount);
                                    
                                    return (
                                        <div key={event.transactionHash + index} className="flex flex-row w-full justify-between mb-3 text-[#747474]">
                                            <div className='w-[20%] text-left'>{index + 1}</div>
                                            <div className='w-[80%] text-left'>{truncateAddress(donor)}</div>
                                            <div className='w-[80%] text-left font-medium text-blue-500 cursor-pointer underline underline-offset-2'>
                                                <Link href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}>
                                                    {truncateAddress(event.transactionHash)}
                                                </Link>
                                            </div>
                                            <div className='w-[30%] text-left'>{formattedAmount}</div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        </>
                        :
                        <></>
                        }

                        {isAdmin && (
                            <div className='flex flex-col mt-10'>
                                <h1 className='text-white font-bold mb-4 text-lg'>MILESTONE DOCUMENT</h1>
                                <div className='bg-[var(--dark-gray)] w-[25vw] text border-[1px] px-6 py-3 border-[#747474] text-blue-500 cursor-pointer underline underline-offset-3 font-semibold'>
                                    <Link href={`https://maroon-high-horse-665.mypinata.cloud/ipfs/${campaign.milestoneIPFSHash}`}>View Document</Link>
                                </div>
                                {(!campaign.approved && campaign.status === 0) && (
                                    <div className='flex flex-col'>
                                        <button 
                                        onClick={handleApproveConfirmation}
                                        className='font-bold px-3 py-3 mt-10 bg-[var(--sblue)] text-black rounded-lg w-[25vw] cursor-pointer hover:bg-[var(--bold-blue)]'
                                        disabled={isApproving}
                                        >
                                        {isApproving ? "Approving..." : "Approve Campaign"}
                                        </button>
                                        <button 
                                        onClick={handleRejectConfirmation}
                                        className='font-bold px-3 py-3 mt-4 bg-red-500 hover:bg-[#cf3c3e] text-white rounded-lg w-[25vw] cursor-pointer'
                                        disabled={isRejecting} >
                                        {isRejecting ? "Rejecting..." : "Reject Campaign"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isRejectModalOpen && (
                    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-[#0E0E0E] p-8 rounded-xl max-w-md w-full mx-4">
                        <h3 className="text-white text-xl font-bold mb-4">
                            Confirm Rejection
                        </h3>
                        <p className="text-[#747474] mb-6">
                            Are you sure you want to reject "{campaign.name}" Campaign?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                            onClick={() => setIsRejectModalOpen(false)}
                            className="px-6 py-2 text-white bg-[#747474] rounded-lg hover:bg-[#5a5a5a]"
                            >
                            Cancel
                            </button>
                            <button
                            onClick={handleReject}
                            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-[#cf3c3e]"
                            >
                            Reject
                            </button>
                        </div>
                        </div>
                    </div>
                    )}

                    {isConfirmModalOpen && (
                    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-[#0E0E0E] p-8 rounded-xl max-w-md w-full mx-4">
                        <h3 className="text-white text-xl font-bold mb-4">
                            Confirm Approval
                        </h3>
                        <p className="text-[#747474] mb-6">
                            Are you sure you want to approve "{campaign.name}" Campaign?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="px-6 py-2 text-white bg-[#747474] rounded-lg hover:bg-[#5a5a5a]"
                            >
                            Cancel
                            </button>
                            <button
                            onClick={handleApprove}
                            className="px-6 py-2 bg-[var(--sblue)] text-black rounded-lg hover:bg-[var(--bold-blue)]"
                            >
                            Approve
                            </button>
                        </div>
                        </div>
                    </div>
                    )}
                    
                    <div className='lg:mt-0 mt-8'>
                        <h1 className='text-white font-bold mb-4 text-lg'>FUND CAMPAIGN</h1>
                        {(!campaign.approved && campaign.status === 0) ? (
                            <div className='px-8 py-12 flex text-[#747474] bg-[#0E0E0E] rounded-xl justify-center items-center w-full lg:w-[25vw] gap-10'>
                                This campaign cannot be funded yet because it is yet to be approved.
                            </div>
                        ) : (!campaign.approved && campaign.status === 2) ? (
                            <div className='px-8 py-12 flex text-[#747474] bg-[#0E0E0E] rounded-xl justify-center items-center w-full lg:w-[25vw] gap-10'>
                                This campaign cannot be funded because the campaign has been rejected.
                            </div>
                        ) : campaign.organization.toLowerCase() === address?.toLowerCase() ? (
                            <div className='px-8 py-12 flex text-[#747474] bg-[#0E0E0E] rounded-xl justify-center items-center w-full lg:w-[25vw] gap-10'>
                                You cannot donate to your own campaign
                            </div>
                        ) : (
                            <form onSubmit={handleDonate} className='px-8 py-12 flex flex-col bg-[#0E0E0E] rounded-xl justify-center items-center w-full lg:w-[25vw] gap-10'>
                                <p className='text-[#747474] text-sm'>Enter the amount that you would want to support this campaign with</p>
                                <input 
                                    type="number" 
                                    name="amount" 
                                    id="amount" 
                                    placeholder="Amount in ETH"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                    className='bg-[#0E0E0E] border-2 border-[#747474] py-3 px-3 text-[#747474] w-full'
                                />
                                <button type="submit" className='w-full font-bold rounded-2xl bg-[var(--sblue)] text-black p-3 text-lg font bold cursor-pointer hover:bg-[var(--bold-blue)]'>Donate</button>
                            </form>
                        )}
                    </div>
                </div>

                <Modal 
                isOpen={isModalOpen} 
                onClose={handleClose}
                txHash={txHash}
                status={isApproving ? "approving" : isRejecting ? "rejecting" : "donating"}
                campaignName={campaign?.name}
                />
            </div>
 
        </div>
    );
}