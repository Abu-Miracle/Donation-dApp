'use client';
import { useState } from 'react';

export function Modal({ isOpen, onClose, txHash }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-[#0E0E0E] p-8 rounded-xl w-[90%] max-w-md">
        {!txHash ? (
          <p className="text-white text-xl mb-4">Processing...</p>
        ) : (
          <>
            <p className="text-white text-xl mb-2">Transaction Hash:</p>
            <p className="text-blue-400 break-all mb-4">{txHash}</p>
          </>
        )}
        <div className="flex justify-end space-x-4">
          <button
            className="bg-[var(--sblue)] text-black px-4 py-2 rounded-xl font-bold"
            onClick={() => {
              // Optionally navigate to the campaigns page
              window.location.href = '/donate';
            }}
          >
            Browse More
          </button>
          <button
            className="bg-gray-400 text-black px-4 py-2 rounded-xl font-bold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
