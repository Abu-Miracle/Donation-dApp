'use client';
import { useState, useEffect } from 'react';
import { useWriteContract } from 'wagmi';
import { ethers } from 'ethers';
import { uploadFileToIPFS } from '../app/newcampaign/pinataHelper';
import abi from '../app/abi/abi.json';

export default function EditCampaignModal({ campaign, onClose, onUpdate }) {
  const { writeContractAsync } = useWriteContract();
  const [fileName, setFileName] = useState(
    campaign.milestoneIPFSHash ? <p className='text-sm md:text-[16px]'>Existing Document.pdf</p> : ''
  );
  const [imageFileName, setImageFileName] = useState(
    campaign.imageUrl ? <p className='text-sm md:text-[16px]'>Existing Image</p> : ''
  );
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description,
    targetAmount: ethers.formatEther(campaign.targetAmount),
    targetDate: new Date(Number(campaign.targetDate )* 1000).toISOString().split('T')[0],
    document: null,
    image: null,
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      // Use existing hashes by default
      let docIpfsHash = campaign.milestoneIPFSHash;
      let imageUrl = campaign.imageUrl;

      // Upload new files if provided
      if (formData.document) {
        docIpfsHash = await uploadFileToIPFS(formData.document);
      }
      if (formData.image) {
        const imageIpfsHash = await uploadFileToIPFS(formData.image);
        imageUrl = `https://maroon-high-horse-665.mypinata.cloud/ipfs/${imageIpfsHash}`;
      }

      const targetAmountWei = ethers.parseEther(formData.targetAmount);
      const targetTimestamp = Math.floor(new Date(formData.targetDate).getTime() / 1000);

      const result = await writeContractAsync({
        abi,
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        functionName: 'updateCampaign',
        args: [
          campaign.id,
          formData.name,
          formData.description,
          targetAmountWei,
          targetTimestamp,
          docIpfsHash,
          imageUrl
        ]
      });

      onUpdate({
        ...campaign,
        ...formData,
        targetAmount: targetAmountWei,
        targetDate: targetTimestamp,
        milestoneIPFSHash: docIpfsHash,
        imageUrl
      });

      onClose();
    } catch (error) {
      console.error("Error updating campaign:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.length) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      // Update file names when new files are selected
      if (name === 'image') {
        setImageFileName(files[0].name);
      } else if (name === 'document') {
        setFileName(files[0].name);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div id='editModal' className="bg-[#0E0E0E] pt-4 px-4 rounded-xl w-[80vw] md:w-[60vw] max-w-2xl mx-4 max-h-[70vh] md:max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl text-white font-bold mb-6 sticky py-4 -top-4 -mx-8 rounded-t-xl px-12 bg-[#0E0E0E] z-10 border-b border-[#1E1E1E]">Edit Campaign</h2>
      
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='flex-1 overflow-y-auto px-4'>
                <div className="mb-10 md:mb-14">
                    <label className="block font-bold text-[16px] md:text-lg text-white mb-2">Campaign Name</label>
                    <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 md:px-6 md:py-3 bg-[#1E1E1E] mx-2 text-white text-sm md:text-[16px] rounded"
                    />
                </div>

                <div className="mb-10 md:mb-14">
                    <label htmlFor="description" className="block mb-2 text-[16px] md:text-lg text-white font-bold">Description/Story</label>
                    <textarea
                        rows='10'
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Write a brief description of the campaign you are trying to create"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 md:px-6 md:py-3 border text-white text-sm md:text-[16px] font-light border-[#747474] rounded"
                    />
                </div>

                <div className='flex md:mb-0 mb-10 flex-col md:flex-row justify-center'>
                    <div className="mb-10 w-full">
                        <label htmlFor="targetAmount" className="block mb-2 text-[16px] md:text-lg text-white font-bold">Target Amount (ETH)</label>
                        <input
                            type="number"
                            id="targetAmount"
                            name="targetAmount"
                            placeholder="Amount in ETH"
                            value={formData.targetAmount}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 md:px-6 md:py-3 border text-white text-[16px] font-light border-[#747474] rounded"
                        />
                    </div>
                    
                    <div className=" md:ml-4 w-full">
                        <label htmlFor="targetDate" className="block mb-2 text-[16px] md:text-lg text-white font-bold">Target Date</label>
                        <input
                            type="date"
                            id="targetDate"
                            name="targetDate"
                            value={formData.targetDate}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 md:px-6 md:py-3 border text-white text-sm md:text-[16px] font-light border-[#747474] rounded"
                        />
                    </div>
                </div>

                <div className='mb-10 md:mb-14 w-full relative'>
                    <label htmlFor="campaignImage" className="block mb-2 text-[16px] md:text-lg text-white font-bold">
                    Campaign Image
                    </label>

                    <div className="relative">
                        <input
                        type="file"
                        id="campaignImage"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full px-4 md:px-6 py-4 md:py-6 border text-transparent text-sm md:text-[16px] font-light border-[#747474] rounded cursor-pointer"
                        />
                        
                        <div className="absolute inset-0 px-6 py-3 flex items-center pointer-events-none">
                            <span className={`text-sm md:text-[16px] font-light  ${imageFileName ? 'text-white' : 'text-[#747474]'}`}>
                                {imageFileName || 
                                <p className='items-center flex'> <span className='text-4xl mr-2 block'>+</span> <span className='block'>Upload Campaign Image</span> 
                                </p>}
                            </span>
                        </div>

                        {imageFileName && 
                            <button 
                                type="button"
                                className="absolute right-7 cursor-pointer top-[50%] font-bold -translate-y-1/2 text-white "
                                onClick={() => {
                                setImageFileName('');
                                setFormData(prev => ({ ...prev, image: null }));
                                document.getElementById('campaignImage').value = '';
                                }}
                            >
                                ✕
                            </button>
                        }
                    </div>
                </div>

                <div className="w-full relative">
                    <label htmlFor="document" className="block mb-2 text-[16px] md:text-lg text-white font-bold">Milestone Document</label>
                    <div className='realtive'>
                        <input
                            type="file"
                            id="document"
                            name="document"
                            accept="application/pdf"
                            onChange={handleChange}
                            className="w-full px-4 md:px-6 py-4 md:py-6 border text-transparent text-sm md:text-[16px] font-light border-[#747474] rounded cursor-pointer"
                        />
                        <div className="absolute inset-0 px-6 py-3 flex items-center pointer-events-none">
                            <span className={`text-sm md:text-[16px] font-light mt-9 ${fileName ? 'text-white' : 'text-[#747474]'}`}>
                                {fileName || 
                                <p className='items-center flex cursor-pointer'> <span className='cursor-pointer text-4xl mr-2 block'>+</span> <span className='block'>Upload a PDF file with evidence of milestone achievement concerning the campaign</span> 
                                </p>}
                            </span>
                        </div>

                        {fileName && 
                            <button 
                                type="button"
                                className="absolute right-7 cursor-pointer top-[65%] font-bold -translate-y-1/2 text-white"
                                onClick={() => {
                                setFileName('');
                                setFormData(prev => ({ ...prev, document: null }));
                                document.getElementById('document').value = '';
                                }}
                            >
                                ✕
                            </button>
                        }
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 rounded-b-xl bg-[#0E0E0E] py-4 border-t -mx-8 px-8 border-[#1E1E1E]">
                <div className='flex justify-end gap-4'>
                    <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 bg-[#555] hover:bg-[#696969] text-white cursor-pointer  rounded-lg font-medium"
                    >
                    Cancel
                    </button>

                    <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-[var(--sblue)] text-black cursor-pointer rounded-lg hover:bg-[var(--bold-blue)] font-[550] disabled:opacity-50"
                    >
                    {uploading ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}