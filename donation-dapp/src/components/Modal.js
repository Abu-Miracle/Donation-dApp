"use client";
import { useState } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import Image from "next/image";

export function Modal({
  isOpen,
  onClose,
  txHash,
  status = "donating",
  campaignName,
  raisedAmount,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-[#0E0E0E] px-8 py-6 rounded-xl w-[90%] max-w-md">
        {!txHash ? (
          <div className="my-4">
            <p className="text-xl text-[#747474] text-center">
              {status === "approving"
                ? `Approving "${campaignName}"...`
                : status === "rejecting"
                ? `Rejecting "${campaignName}"...`
                : status === "releasing"
                ? `Releasing ${ethers.formatEther(
                    raisedAmount
                  )} ETH to ${campaignName}...`
                : "Processing Donation..."}
            </p>
            <p className="text-[#747474] text-sm text-center mt-2 py-2">
              Please wait for confirmation of transaction in your wallet
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col mb-4">
              <span className="text-white text-xl font-bold">
                {status === "approving" ? (
                  "Approval Successful!"
                ) : status === "rejecting" ? (
                  "Rejection Successful!"
                ) : status === "releasing" ? (
                  "Funds Released Successfully!"
                ) : (
                  <div className="flex flex-col justify-center items-center">
                    <Image
                      src="/verified.svg"
                      alt="Locked"
                      width={30}
                      height={30}
                      className="w-20 h-20 mb-2"
                    />
                    <span className="text-2xl">Donation Successful!</span>
                    <span className="mt-1 text-lg font-medium">
                      Thank you for your support
                    </span>
                  </div>
                )}
              </span>
              {campaignName && (
                <span className="text-[#747474] text-sm mt-3">
                  Campaign: {campaignName}
                </span>
              )}
            </div>
            <div className="mb-6">
              <p className="text-[#747474] text-sm mb-1">Transaction Hash:</p>
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
              className="bg-[var(--sblue)] text-black px-4 py-2 rounded-lg cursor-pointer font-semibold hover:bg-[var(--light-blue)] transition-colors"
              onClick={() => (window.location.href = "/donate")}
            >
              Browse More
            </button>
          )}
          <button
            className="bg-[#555] text-white px-4 py-2 rounded-lg cursor-pointer font-medium hover:bg-[#696969] transition-colors"
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
