import React, { useState, useEffect } from 'react';
import { formatEther, BrowserProvider } from 'ethers';
import { FaWallet, FaEthereum } from 'react-icons/fa';
import { FcBusinessman } from "react-icons/fc";
import { PUBLIC_LICENSE_CONTRACT_ADDRESS } from '../config/contract';
import PublicLicense from '../artifacts/contracts/PublicLicense.sol/PublicLicense.json';
import { ethers } from 'ethers';


const WalletLogin = ({ onLogin }) => {
    const [address, setAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const savedAddress = sessionStorage.getItem('walletAddress');
        const savedBalance = sessionStorage.getItem('walletBalance');
        const savedRole = sessionStorage.getItem('role');

        if (savedAddress) {
            setAddress(savedAddress);
            setBalance(savedBalance);
            if (savedRole) {
                setRole(savedRole);
            } else {
                fetchRoleFromContract(savedAddress).then(userRole => {
                    setRole(userRole);
                    sessionStorage.setItem('role', userRole);
                });
            }
        }
    }, []);

    useEffect(() => {
        if (!address) return;

        sessionStorage.setItem('walletAddress', address);
        fetchBalance(address);

        fetchRoleFromContract(address).then(userRole => {
            setRole(userRole);
            sessionStorage.setItem('role', userRole);
        });

        onLogin?.(address);
    }, [address]);

    const getWeb3Provider = () => {
        if (typeof window.ethereum !== 'undefined') {
            return new BrowserProvider(window.ethereum);
        } else {
            throw new Error('MetaMask not installed');
        }
    };

    const connectWallet = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed');
            }

            const browserProvider = new BrowserProvider(window.ethereum);
            setProvider(browserProvider); // Fix here!

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const signer = await browserProvider.getSigner();
            const address = await signer.getAddress();

            setAddress(address);
            sessionStorage.setItem('walletAddress', address);
            fetchBalance(address, browserProvider);
            onLogin?.(address);
        } catch (error) {
            console.error('MetaMask connection failed:', error);
        }
    };



    const fetchRoleFromContract = async (address) => {
        try {
            const provider = getWeb3Provider();
            const contract = new ethers.Contract(PUBLIC_LICENSE_CONTRACT_ADDRESS, PublicLicense.abi, provider);
            const userRole = await contract.getRole(address);
            return userRole;
        } catch (error) {
            console.error('Error fetching role from contract:', error);
            return 'Unknown';
        }
    };

    const fetchBalance = async (walletAddress) => {
        try {
            if (!provider) return;
            const balance = await provider.getBalance(walletAddress);
            setBalance(Number(formatEther(balance)).toFixed(2));
            sessionStorage.setItem('walletBalance', Number(formatEther(balance)).toFixed(2));
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const disconnectWallet = () => {
        setAddress(null);
        setBalance(null);
        sessionStorage.removeItem('walletAddress');
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center w-1/2 mx-auto my-8 p-6 space-y-4">
            <img src="/images/neural-eth.png" alt="athereum loggo" className="w-48 h-48 mb-4" />
            <h2 className="text-2xl font-bold text-center flex items-center justify-center">
                <FaWallet className="mr-2" />  Wallet
            </h2>

            {!address ? (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center text-xl gap-2 justify-center w-4/12 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium rounded-xl shadow-lg hover:from-violet-700 hover:to-blue-600 transition duration-300 cursor-pointer"
                >
                    <FaWallet className="" /> <span className='flex flex-row'>Connect</span>
                </button>
            ) : (
                <div className="p-4 rounded-lg shadow w-full space-y-2 flex items-center flex-col">
                    <div className="flex items-center flex-wrap">
                        <FaWallet className="mr-2 text-blue-600" />
                        <span className="ml-2 overflow-hidden"><b>Address:</b> {address}</span>
                    </div>
                    {balance && (
                        <div className="flex items-center flex-wrap">
                            <FaEthereum className="mr-2 text-purple-600" />
                            <span className="font-semibold">Balance:</span>
                            <span className="ml-2">{balance} ETH</span>
                        </div>
                    )}
                    {role && (
                        <div className="flex items-center flex-wrap">
                            <FcBusinessman className="mr-2" size={25} />
                            <div className="text-gray-700 font-medium"><span className="font-semibold">Role:</span> {role}</div>
                        </div>
                    )}

                    <button
                        onClick={disconnectWallet}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg w-1/2 flex items-center justify-center mt-2"
                    >
                        <FaWallet className="mr-2" /> Disconnect Wallet
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    <div className="bg-white p-6 rounded-lg relative z-10 space-y-4 w-4/12">
                        <h3 className="text-2xl font-bold">Connect Wallet</h3>
                        <p className='text-s text-gray-600 flex justify-center flex-col'>
                            Please connect your wallet to continue.

                            <span>The system supports the following wallets:</span>
                        </p>
                        <button
                            onClick={() => connectWallet('metamask')}
                            className="px-4 py-2 bg-transparent border border-gray-300 shadow-lg rounded-lg text-gray-600 w-full flex items-center justify-start gap-4"
                        >

                            <svg xmlns="http://www.w3.org/2000/svg" className='w-10 h-10' viewBox="0 0 212 189" id="metamask">
                                <g fill="none" fill-rule="evenodd">
                                    <polygon fill="#CDBDB2" points="60.75 173.25 88.313 180.563 88.313 171 90.563 168.75 106.313 168.75 106.313 180 106.313 187.875 89.438 187.875 68.625 178.875"></polygon>
                                    <polygon fill="#CDBDB2" points="105.75 173.25 132.75 180.563 132.75 171 135 168.75 150.75 168.75 150.75 180 150.75 187.875 133.875 187.875 113.063 178.875" transform="matrix(-1 0 0 1 256.5 0)"></polygon>
                                    <polygon fill="#393939" points="90.563 152.438 88.313 171 91.125 168.75 120.375 168.75 123.75 171 121.5 152.438 117 149.625 94.5 150.188"></polygon>
                                    <polygon fill="#F89C35" points="75.375 27 88.875 58.5 95.063 150.188 117 150.188 123.75 58.5 136.125 27"></polygon>
                                    <polygon fill="#F89D35" points="16.313 96.188 .563 141.75 39.938 139.5 65.25 139.5 65.25 119.813 64.125 79.313 58.5 83.813"></polygon>
                                    <polygon fill="#D87C30" points="46.125 101.25 92.25 102.375 87.188 126 65.25 120.375"></polygon>
                                    <polygon fill="#EA8D3A" points="46.125 101.813 65.25 119.813 65.25 137.813"></polygon>
                                    <polygon fill="#F89D35" points="65.25 120.375 87.75 126 95.063 150.188 90 153 65.25 138.375"></polygon>
                                    <polygon fill="#EB8F35" points="65.25 138.375 60.75 173.25 90.563 152.438"></polygon>
                                    <polygon fill="#EA8E3A" points="92.25 102.375 95.063 150.188 86.625 125.719"></polygon>
                                    <polygon fill="#D87C30" points="39.375 138.938 65.25 138.375 60.75 173.25"></polygon>
                                    <polygon fill="#EB8F35" points="12.938 188.438 60.75 173.25 39.375 138.938 .563 141.75"></polygon>
                                    <polygon fill="#E8821E" points="88.875 58.5 64.688 78.75 46.125 101.25 92.25 102.938"></polygon>
                                    <polygon fill="#DFCEC3" points="60.75 173.25 90.563 152.438 88.313 170.438 88.313 180.563 68.063 176.625"></polygon>
                                    <polygon fill="#DFCEC3" points="121.5 173.25 150.75 152.438 148.5 170.438 148.5 180.563 128.25 176.625" transform="matrix(-1 0 0 1 272.25 0)"></polygon>
                                    <polygon fill="#393939" points="70.313 112.5 64.125 125.438 86.063 119.813" transform="matrix(-1 0 0 1 150.188 0)"></polygon>
                                    <polygon fill="#E88F35" points="12.375 .563 88.875 58.5 75.938 27"></polygon>
                                    <path fill="#8E5A30" d="M12.3750002,0.562500008 L2.25000003,31.5000005 L7.87500012,65.250001 L3.93750006,67.500001 L9.56250014,72.5625 L5.06250008,76.5000011 L11.25,82.1250012 L7.31250011,85.5000013 L16.3125002,96.7500014 L58.5000009,83.8125012 C79.1250012,67.3125004 89.2500013,58.8750003 88.8750013,58.5000009 C88.5000013,58.1250009 63.0000009,38.8125006 12.3750002,0.562500008 Z"></path>
                                    <g transform="matrix(-1 0 0 1 211.5 0)">
                                        <polygon fill="#F89D35" points="16.313 96.188 .563 141.75 39.938 139.5 65.25 139.5 65.25 119.813 64.125 79.313 58.5 83.813"></polygon>
                                        <polygon fill="#D87C30" points="46.125 101.25 92.25 102.375 87.188 126 65.25 120.375"></polygon>
                                        <polygon fill="#EA8D3A" points="46.125 101.813 65.25 119.813 65.25 137.813"></polygon>
                                        <polygon fill="#F89D35" points="65.25 120.375 87.75 126 95.063 150.188 90 153 65.25 138.375"></polygon>
                                        <polygon fill="#EB8F35" points="65.25 138.375 60.75 173.25 90 153"></polygon>
                                        <polygon fill="#EA8E3A" points="92.25 102.375 95.063 150.188 86.625 125.719"></polygon>
                                        <polygon fill="#D87C30" points="39.375 138.938 65.25 138.375 60.75 173.25"></polygon>
                                        <polygon fill="#EB8F35" points="12.938 188.438 60.75 173.25 39.375 138.938 .563 141.75"></polygon>
                                        <polygon fill="#E8821E" points="88.875 58.5 64.688 78.75 46.125 101.25 92.25 102.938"></polygon>
                                        <polygon fill="#393939" points="70.313 112.5 64.125 125.438 86.063 119.813" transform="matrix(-1 0 0 1 150.188 0)"></polygon>
                                        <polygon fill="#E88F35" points="12.375 .563 88.875 58.5 75.938 27"></polygon>
                                        <path fill="#8E5A30" d="M12.3750002,0.562500008 L2.25000003,31.5000005 L7.87500012,65.250001 L3.93750006,67.500001 L9.56250014,72.5625 L5.06250008,76.5000011 L11.25,82.1250012 L7.31250011,85.5000013 L16.3125002,96.7500014 L58.5000009,83.8125012 C79.1250012,67.3125004 89.2500013,58.8750003 88.8750013,58.5000009 C88.5000013,58.1250009 63.0000009,38.8125006 12.3750002,0.562500008 Z"></path>
                                    </g>
                                </g>
                            </svg>
                            MetaMask Wallet


                        </button>

                        <button
                            onClick={() => connectWallet('coinbase')}
                            className="px-4 py-2 bg-transparent border border-gray-300 shadow-lg rounded-lg text-gray-600 w-full flex items-center justify-start gap-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className='w-10 h-10' fill="none" viewBox="0 0 512 512" id="coinbase">
                                <g clip-path="url(#clip0_84_15704)">
                                    <rect width="512" height="512" fill="#0052FF" rx="60"></rect>
                                    <path fill="#0052FF" d="M255.5 40C375.068 40 472 136.932 472 256.5C472 376.068 375.068 473 255.5 473C135.932 473 39 376.068 39 256.5C39 136.932 135.932 40 255.5 40Z"></path>
                                    <path fill="#fff" d="M255.593 331.733C213.515 331.733 179.513 297.638 179.513 255.653C179.513 213.668 213.608 179.573 255.593 179.573C293.258 179.573 324.535 206.999 330.547 242.973H407.19C400.71 164.826 335.337 103.398 255.5 103.398C171.436 103.398 103.245 171.589 103.245 255.653C103.245 339.717 171.436 407.907 255.5 407.907C335.337 407.907 400.71 346.48 407.19 268.333H330.453C324.441 304.307 293.258 331.733 255.593 331.733Z"></path>
                                </g>
                                <defs>
                                    <clipPath id="clip0_84_15704">
                                        <rect width="512" height="512" fill="#fff"></rect>
                                    </clipPath>
                                </defs>
                            </svg>
                            Coinbase Wallet
                        </button>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg w-full flex items-center justify-center"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletLogin;
