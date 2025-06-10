import React, { useState, useEffect } from 'react';
import { formatEther, BrowserProvider } from 'ethers';
import { FaWallet, FaEthereum } from 'react-icons/fa';
import { FcBusinessman } from 'react-icons/fc';
import axios from 'axios';
import { PUBLIC_LICENSE_CONTRACT_ADDRESS } from '../config/contract';
import PublicLicense from '../artifacts/contracts/PublicLicense.sol/PublicLicense.json';
import { ethers } from 'ethers';
import { NavLink } from "react-router";

const Register = () => {
    const [address, setAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [provider, setProvider] = useState(null);
    const [role, setRole] = useState(null);

    const connectWallet = async () => {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed');
            }

            const browserProvider = new BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const signer = await browserProvider.getSigner();
            const addr = await signer.getAddress();

            setAddress(addr);
            sessionStorage.setItem('walletAddress', addr);
            fetchBalance(addr, browserProvider);

            const role = await fetchRoleFromContract(addr);
            setRole(role);
            sessionStorage.setItem('role', role);

            await registerUser(addr);
        } catch (error) {
            console.error('MetaMask connection failed:', error);
        } finally {
            setIsModalOpen(false);
        }
    };

    const fetchBalance = async (walletAddr, providerInstance) => {
        try {
            const bal = await providerInstance.getBalance(walletAddr);
            const formatted = Number(ethers.formatEther(bal)).toFixed(2);
            setBalance(formatted);
            sessionStorage.setItem('walletBalance', formatted);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const fetchRoleFromContract = async (addr) => {
        try {
            const contract = new ethers.Contract(
                PUBLIC_LICENSE_CONTRACT_ADDRESS,
                PublicLicense.abi,
                provider
            );
            return await contract.getRole(addr);
        } catch (error) {
            console.error('Error fetching role from contract:', error);
            return 'Unknown';
        }
    };

    const registerUser = async (ethAddress) => {
        try {
            const newUser = {
                UserType: 'wallet',
                UserName: '',
                Email: '',
                EthAddress: ethAddress,
            };
            const res = await axios.post('/users', newUser);
            console.log('User registered:', res.data);
        } catch (error) {
            console.error('User registration failed:', error);
        }
    };

    const disconnectWallet = () => {
        setAddress(null);
        setBalance(null);
        setRole(null);
        sessionStorage.clear();
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center w-1/2 mx-auto my-8 p-6 space-y-4">
            <img src="/images/neural-eth.png" alt="eth logo" className="w-48 h-48 mb-4" />
            <h2 className="text-2xl font-bold text-center flex items-center justify-center">
                <FaWallet className="mr-2" /> Wallet
            </h2>

            {!address ? (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center text-xl gap-2 justify-center w-4/12 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium rounded-xl shadow-lg hover:from-violet-700 hover:to-blue-600 transition duration-300 cursor-pointer"
                >
                    <FaWallet /> <span>Connect</span>
                </button>
            ) : (
                <div className="p-4 rounded-lg shadow w-full space-y-2 flex items-center flex-col">
                    <div className="flex items-center flex-wrap">
                        <FaWallet className="mr-2 text-blue-600" />
                        <span className="ml-2"><b>Address:</b> {address}</span>
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
                        <p className='text-sm text-gray-600'>
                            Please connect your wallet to register. Supported wallets: MetaMask.
                        </p>
                        <button
                            onClick={connectWallet}
                            className="px-4 py-2 bg-transparent border border-gray-300 shadow-lg rounded-lg text-gray-600 w-full flex items-center justify-start gap-4"
                        >
                            <img src="/icons/metamask.svg" alt="MetaMask" className="w-6 h-6" />
                            <span>Connect MetaMask</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
