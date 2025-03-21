'use client';

import Navbar from '../../components/Navbar';
import { useState } from 'react';
import "../globals.css";

export default function NewCampaign() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        document: null,
      });
      const [fileName, setFileName] = useState('');

      const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
          // For file input
          setFormData({
            ...formData,
            [name]: files[0],
          });
        } else {
          setFormData({
            ...formData,
            [name]: value,
          });
        }
        const file = e.target.files[0];
            if (file) {
                setFileName(file.name);
            }
      };

      
    return(
        <div className="min-h-screen bg-black pb-20">
            <Navbar />

            <div className='justify-center mx-auto mt-20 h-auto bg-[#0E0E0E] w-[80%] px-30 py-20 rounded-3xl'>
                <h1 className='text-white text-center font-bold text-2xl mb-7'>Create a Campaign</h1>

                <form action="" method="">
                    <div className="mb-14">
                        <label htmlFor="name" className="block mb-2 text-xl text-white font-bold">Campaign Name*</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter campaign name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-6 py-3 border text-white text-[18px] font-light border-[#747474] rounded"
                        />
                    </div>

                    <div className="mb-14">
                        <label htmlFor="description" className="block mb-2 text-xl text-white font-bold">Description/Story*</label>
                        <textarea
                            rows='10'
                            type="text"
                            id="description"
                            name="description"
                            placeholder="Write a brief description of the campaign you are trying to create"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="w-full px-6 py-3 border text-white text-[18px] font-light border-[#747474] rounded"
                        />
                    </div>

                    <div className='flex flex-row justify-center'>
                        <div className="mb-14 w-full">
                            <label htmlFor="targetAmount" className="block mb-2 text-xl text-white font-bold">Target Amount (ETH)*</label>
                            <input
                                type="number"
                                id="targetAmount"
                                name="targetAmount"
                                placeholder="Amount in ETH"
                                value={formData.targetAmount}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-3 border text-white text-[18px] font-light border-[#747474] rounded"
                            />
                        </div>
                        <div className="ml-4 w-full">
                            <label htmlFor="targetDate" className="block mb-2 text-xl text-white font-bold">Target Date*</label>
                            <input
                                type="date"
                                id="targetDate"
                                name="targetDate"
                                value={formData.targetDate}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-3 border text-white text-[18px] font-light border-[#747474] rounded"
                            />
                        </div>
                    </div>

                    <div className="w-full relative">
                        <label htmlFor="document" className="block mb-2 text-xl text-white font-bold">Milestone Document*</label>
                        <div className='realtive'>
                            <input
                                type="file"
                                id="document"
                                name="document"
                                accept="application/pdf"
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-6 border text-transparent text-[18px] font-light border-[#747474] rounded cursor-pointer"
                            />
                            <div className="absolute inset-0 px-6 py-3 flex items-center pointer-events-none">
                                <span className={`text-[18px] font-light mt-9 ${fileName ? 'text-white' : 'text-[#747474]'}`}>
                                    {fileName || 
                                    <p className='items-center flex'> <span className='text-4xl mr-2 block'>+</span> <span className='block'>Upload a PDF file with evidence of milestone achievement concerning the campaign</span> 
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

                    <button type="submit" className="bg-[var(--sblue)] text-black py-4 px-6 font-bold text-xl rounded-2xl hover:bg-[var(--light-blue)] block mx-auto mt-16">
                        Submit New Campaign
                    </button>

                </form>
            </div>
        </div>
    );
}