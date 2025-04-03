'use client';
import { useState } from 'react';
import Link from 'next/link';

export function Modal({ isOpen, onClose, txHash }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-[#0E0E0E] px-8 py-4 rounded-xl w-[90%] max-w-md">
        {!txHash ? (
          <p className="text-xl my-8 flex justify-center text-[#747474]">Processing...</p>
        ) : (
          <>
            <p className='flex flex-col'>
              <span className="text-white text-xl mb-2 font-bold">Donation Successful! </span>
              <span className='text-[#747474] text-lg font-normal mb-1'>Transaction Hash:</span>
            </p>
            <Link href={`https://sepolia.etherscan.io/tx/${txHash}`}>
              <p className="text-blue-400 break-all text-[16px] mb-4 cursor-pointer">{txHash}</p>
            </Link>
          </>
        )}
        <div className="flex justify-end space-x-4">
          <button
            className="bg-[var(--sblue)] text-black cursor-pointer px-4 py-1 rounded-lg font-semibold text-[14px]"
            onClick={() => {
              // Optionally navigate to the campaigns page
              window.location.href = '/donate';
            }}
          >
            Browse More
          </button>
          <button
            className="bg-[#585858] text-white cursor-pointer px-4 py-1 rounded-lg font-semibold text-[14px]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
