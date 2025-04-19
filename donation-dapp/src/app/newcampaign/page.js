'use client';

import Navbar from '../../components/Navbar';
import { useWriteContract } from 'wagmi';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import "../globals.css";
import abi from '../abi/abi.json';
import { uploadFileToIPFS } from './pinataHelper';


const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function NewCampaign() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        document: null,
        image: null,
    });
    const [fileName, setFileName] = useState('');
    const [imageFileName, setImageFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [campaignArgs, setCampaignArgs] = useState(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files.length > 0) {
          // Update formData with the selected file
          setFormData({
            ...formData,
            [name]: files[0],
          });
    
          // Depending on which input changed, update the correct file name
          if (name === 'image') {
            setImageFileName(files[0].name);
          } else if (name === 'document') {
            setFileName(files[0].name);
          }
        } else {
          setFormData({
            ...formData,
            [name]: value,
          });
        }
      };

    const { writeContract, writeContractAsync } = useWriteContract();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setUploading(true);
            // Upload file to IPFS and get CID
            const docIpfsHash = await uploadFileToIPFS(formData.document);

            // Optionally, upload the campaign image to IPFS if provided.
            let imageUrl = "";
            let imageIpfsHash = null;
            if(formData.image) {
                imageIpfsHash = await uploadFileToIPFS(formData.image);
                imageUrl = `https://maroon-high-horse-665.mypinata.cloud/ipfs/${imageIpfsHash}`;
            }
            setUploading(false);

            // 2. Parse the target amount (in ETH) to wei
            const targetAmountWei = ethers.parseEther(formData.targetAmount)
            console.log("Parsed targetAmountWei:", targetAmountWei.toString());

            // 3. Convert the target date to a Unix timestamp
            // Assuming formData.targetDate is in YYYY-MM-DD format
            const targetTimestamp = Math.floor(new Date(formData.targetDate).getTime() / 1000);
            console.log("Parsed targetTimestamp:", targetTimestamp.toString());

            // 4. Prepare the contract write configuration using wagmi
            // This prepares a configuration object that can be used to call the contract function
            const args = [
                formData.name,
                formData.description,
                targetAmountWei,
                targetTimestamp,
                docIpfsHash,
                imageUrl
            ];
            setCampaignArgs(args);

            if (writeContract && args) {
                writeContractAsync({
                  abi,
                  address: contractAddress,
                  functionName: 'createCampaign',
                  args: args,
                })
                .then((data) => {
                    console.log('Campaign created successfully!', data);
                    alert('Campaign created successfully!');
                })
                .catch((error) => {
                    console.error('Error executing transaction:', error);
                });
            }
            console.log("Doc IPFS Hash: ", docIpfsHash);
            console.log("Image URL: ", imageUrl);
            console.log("Image IPFS Hash: ", imageIpfsHash);
        } catch  (error) {
            console.error("Error creating campaign: ", error);
            setUploading(false);
        }
    };
    // 1745107200
      
    return(
        <div className="min-h-screen bg-black md:pb-20">
            <Navbar />

            <div className=' justify-center md:mx-auto md:mt-18 h-auto md:bg-[#0E0E0E] w-full md:w-[80%] px-10 md:px-20 lg:px-28 py-16 rounded-3xl'>
                <h1 className='text-white md:text-center font-bold text-2xl md:text-xl mb-7'>Create a Campaign</h1>

                <form action="" method="" onSubmit={handleSubmit}>
                    <div className="mb-14">
                        <label htmlFor="name" className="block mb-2 text-lg text-white font-bold">Campaign Name*</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter campaign name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-6 py-3 border text-white text-[16px] font-light border-[#747474] rounded"
                        />
                    </div>

                    <div className="mb-14">
                        <label htmlFor="description" className="block mb-2 text-lg text-white font-bold">Description/Story*</label>
                        <textarea
                            rows='10'
                            type="text"
                            id="description"
                            name="description"
                            placeholder="Write a brief description of the campaign you are trying to create"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="w-full px-6 py-3 border text-white text-[16px] font-light border-[#747474] rounded"
                        />
                    </div>

                    <div className='flex md:mb-0 mb-14 flex-col md:flex-row justify-center'>
                        <div className="mb-14 w-full">
                            <label htmlFor="targetAmount" className="block mb-2 text-lg text-white font-bold">Target Amount (ETH)*</label>
                            <input
                                type="number"
                                id="targetAmount"
                                name="targetAmount"
                                placeholder="Amount in ETH"
                                value={formData.targetAmount}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-3 border text-white text-[16px] font-light border-[#747474] rounded"
                            />
                        </div>
                        
                        <div className="md:ml-4 w-full">
                            <label htmlFor="targetDate" className="block mb-2 text-lg text-white font-bold">Target Date*</label>
                            <input
                                type="date"
                                id="targetDate"
                                name="targetDate"
                                value={formData.targetDate}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-3 border text-white text-[16px] font-light border-[#747474] rounded"
                            />
                        </div>
                    </div>

                    <div className='mb-14 w-full relative'>
                        <label htmlFor="campaignImage" className="block mb-2 text-lg text-white font-bold">
                        Campaign Image
                        </label>

                        <div className="relative">
                            <input
                            type="file"
                            id="campaignImage"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full px-6 py-6 border text-transparent text-[16px] font-light border-[#747474] rounded cursor-pointer"
                            />
                            
                            <div className="absolute inset-0 px-6 py-3 flex items-center pointer-events-none">
                                <span className={`text-[18px] font-light  ${imageFileName ? 'text-white' : 'text-[#747474]'}`}>
                                    {imageFileName || 
                                    <p className='items-center flex'> <span className='text-4xl mr-2 block'>+</span> <span className='block'>Upload Campaign Image</span> 
                                    </p>}
                                </span>
                            </div>

                            {imageFileName && 
                                <button 
                                    type="button"
                                    className="absolute right-7 top-[50%] font-bold -translate-y-1/2 text-white "
                                    onClick={() => {
                                        setImageFileName('');
                                        setFormData({ ...formData, image: null });
                                        document.getElementById('campaignImage').value = '';
                                    }}
                                >
                                    ✕
                                </button>
                            }
                        </div>
                    </div>

                    <div className="w-full relative">
                        <label htmlFor="document" className="block mb-2 text-lg text-white font-bold">Milestone Document*</label>
                        <div className='realtive'>
                            <input
                                type="file"
                                id="document"
                                name="document"
                                accept="application/pdf"
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-14 md:py-6 border text-transparent text-[16px] font-light border-[#747474] rounded cursor-pointer"
                            />
                            <div className="absolute inset-0 px-6 py-3 flex items-center pointer-events-none">
                                <span className={`text-[18px] font-light mt-9 ${fileName ? 'text-white' : 'text-[#747474]'}`}>
                                    {fileName || 
                                    <p className='items-center flex cursor-pointer'> <span className='cursor-pointer text-4xl mr-2 block'>+</span> <span className='block'>Upload a PDF file with evidence of milestone achievement concerning the campaign</span> 
                                    </p>}
                                </span>
                            </div>

                            {fileName && 
                                <button 
                                    type="button"
                                    className="absolute right-7 top-[65%] font-bold -translate-y-1/2 text-white"
                                    onClick={() => {
                                        setFileName('');
                                        setFormData({ ...formData, document: null });
                                        document.getElementById('document').value = '';
                                    }}
                                >
                                    ✕
                                </button>
                            }
                        </div>
                    </div>

                    <button type="submit" className="bg-[var(--sblue)] text-black py-4 px-6 font-bold text-lg rounded-lg md:rounded-2xl hover:bg-[var(--light-blue)] block mx-auto mt-10 md:mt-16">
                    {uploading ? 'Uploading...' : 'Submit New Campaign'}
                    </button>

                </form>
            </div>
        </div>
    );
}