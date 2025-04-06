'use client';
import { useState } from 'react';
import Link from 'next/link';

export function Modal({ isOpen, onClose, txHash, status = "donating", campaignName }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-[#0E0E0E] px-8 py-6 rounded-xl w-[90%] max-w-md">
        {!txHash ? (
          <div className="my-4">
            <p className="text-xl text-[#747474] text-center">
              {status === "approving" ? 
                `Approving "${campaignName}"...` : 
                "Processing Donation..."
              }
            </p>
            <p className="text-[#747474] text-sm text-center mt-2 py-2">
              Please confirm the transaction in your wallet
            </p>
          </div>
        ) : (
          <>
            <p className='flex flex-col mb-4'>
              <span className="text-white text-xl font-bold">
                {status === "approving" ? "Approval Successful!" : "Donation Successful!"}
              </span>
              {campaignName && (
                <span className='text-[#747474] text-sm mt-1'>
                  Campaign: {campaignName}
                </span>
              )}
            </p>
            <div className='mb-6'>
              <p className='text-[#747474] text-sm mb-1'>Transaction Hash:</p>
              <Link 
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                className="text-blue-400 break-all text-sm hover:underline"
              >
                {txHash}
              </Link>
            </div>
          </>
        )}

        <div className="flex justify-end gap-4">
          {status === "donating" && txHash && (
            <button
              className="bg-[var(--sblue)] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[var(--bold-blue)] transition-colors"
              onClick={() => window.location.href = '/donate'}
            >
              Browse More
            </button>
          )}
          <button
            className="bg-[#585858] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#6b6b6b] transition-colors"
            onClick={onClose}
          >
            {txHash ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// BASE - https://base-sepolia.blockscout.com/tx/
// OR - https://sepolia.basescan.org/tx/
// SEPOLIA - https://sepolia.etherscan.io/tx/
