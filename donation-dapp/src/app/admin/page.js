'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '../../components/Navbar';

export default function AdminPage() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
    const isAdmin = isConnected && address?.toLowerCase() === adminAddress?.toLowerCase();

    useEffect(() => {
        if (isConnected && !isAdmin) {
            // Redirect if connected user is not admin.
            router.replace('/');
        }
    }, [isConnected, isAdmin, router]);

    if (!isConnected) {
        return <p className="text-white text-center mt-8">Connect your wallet to view this page.</p>;
    }
    if (!isAdmin) {
        return <p className="text-white text-center mt-8">You are not authorized to view this page.</p>;
    }

    return(
        <div className="min-h-screen bg-black">
            <Navbar />
            <h1 className="text-2xl text-center mt-16 font-bold text-white">Admin Dashboard</h1>
        </div>
    );
}