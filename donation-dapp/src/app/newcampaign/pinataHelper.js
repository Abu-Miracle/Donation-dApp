import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT, // Ensure this is set in your environment
  pinataGateway: "maroon-high-horse-665.mypinata.cloud", // Optional: customize your gateway if needed
});

export async function uploadFileToIPFS(file) {
  try {
    const uploadResponse = await pinata.upload.public.file(file);
    return uploadResponse.cid; // Return the IPFS CID for your smart contract
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw error;
  }
}
