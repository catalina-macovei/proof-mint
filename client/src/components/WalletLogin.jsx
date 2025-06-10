import React, { useState, useEffect } from 'react';
import { formatEther, BrowserProvider } from 'ethers';
import { FaWallet, FaEthereum, FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { FcBusinessman } from 'react-icons/fc';
import axios from 'axios';
import { PUBLIC_LICENSE_CONTRACT_ADDRESS } from '../config/contract';
import PublicLicense from '../artifacts/contracts/PublicLicense.sol/PublicLicense.json';
import { ethers } from 'ethers';
import { NavLink } from "react-router";

const WalletLogin = ({ onLogin }) => {
    const [address, setAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [role, setRole] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateMessageType, setUpdateMessageType] = useState('');

    // Profile form state
    const [profileData, setProfileData] = useState({
        UserType: '',
        UserName: '',
        Email: ''
    });

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
                fetchRoleFromContract(savedAddress)
                    .then(userRole => {
                        setRole(userRole);
                        sessionStorage.setItem('role', userRole);
                    });
            }
            // Fetch user info when address is loaded
            fetchUserInfo(savedAddress);
        }
    }, []);

    useEffect(() => {
        if (!address) return;

        sessionStorage.setItem('walletAddress', address);
        fetchBalance(address);
        fetchRoleFromContract(address)
            .then(userRole => {
                setRole(userRole);
                sessionStorage.setItem('role', userRole);
            });

        // Persist user to backend db
        registerOrFetchUser(address);

        onLogin?.(address);
    }, [address]);

    const fetchUserInfo = async (ethAddress) => {
        try {
            const res = await axios.get(`/users/eth/${ethAddress}`);
            if (res.status === 200) {
                setUserInfo(res.data);
                setProfileData({
                    UserType: res.data.UserType || res.data.usertype || '',
                    UserName: res.data.UserName || res.data.username || '',
                    Email: res.data.Email || res.data.email || ''
                });
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const getWeb3Provider = () => {
        if (typeof window.ethereum !== 'undefined') {
            return new BrowserProvider(window.ethereum);
        }
        throw new Error('MetaMask not installed');
    };

    const registerOrFetchUser = async (ethAddress) => {
        try {
            // Check if user exists by ETH address
            const res = await axios.get(`/users/eth/${ethAddress}`);
            console.log(res);

            if (res.status === 404) {
                const newUser = {
                    UserType: 'wallet',
                    UserName: '',
                    Email: '',
                    EthAddress: ethAddress
                };
                await axios.post('/users', newUser);
            } else {
                setUserInfo(res.data);
                setProfileData({
                    UserType: res.data.UserType || res.data.usertype || '',
                    UserName: res.data.UserName || res.data.username || '',
                    Email: res.data.Email || res.data.email || ''
                });
            }
        } catch (error) {
            console.error('Error registering/fetching user:', error);
            if (error.response?.status === 404) {
                const newUser = {
                    UserType: 'wallet',
                    UserName: '',
                    Email: '',
                    EthAddress: ethAddress
                };
                const res = await axios.post('/users', newUser);
                console.log(res);
                setUserInfo(res.data);
            }
        }
    };

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
        } catch (error) {
            console.error('MetaMask connection failed:', error);
        } finally {
            setIsModalOpen(false);
        }
    };

    const fetchRoleFromContract = async (addr) => {
        try {
            const provider = getWeb3Provider();
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

    const fetchBalance = async (walletAddr) => {
        try {
            if (!provider) return;
            const bal = await provider.getBalance(walletAddr);
            const formatted = Number(formatEther(bal)).toFixed(2);
            setBalance(formatted);
            sessionStorage.setItem('walletBalance', formatted);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateMessage('');

        try {
            if (!userInfo?.UserID && !userInfo?.userid) {
                throw new Error('User ID not found');
            }

            const userId = userInfo.UserID || userInfo.userid;
            const updateData = {
                UserType: profileData.UserType,
                UserName: profileData.UserName,
                Email: profileData.Email,
                EthAddress: address // Keep the same eth address
            };

            const res = await axios.put(`/users/${userId}`, updateData);

            if (res.status === 200) {
                setUserInfo(res.data);
                setUpdateMessage('Profile updated successfully!');
                setUpdateMessageType('success');
                setTimeout(() => {
                    setUpdateMessage('');
                    setIsProfileModalOpen(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setUpdateMessage('Failed to update profile: ' + (error.response?.data?.error || error.message));
            setUpdateMessageType('error');
        } finally {
            setIsUpdating(false);
        }
    };

    const disconnectWallet = () => {
        setAddress(null);
        setBalance(null);
        setUserInfo(null);
        setProfileData({ UserType: '', UserName: '', Email: '' });
        sessionStorage.removeItem('walletAddress');
        sessionStorage.removeItem('walletBalance');
        sessionStorage.removeItem('role');
        window.location.reload();
    };

    return (
        <div className="flex flex-col items-center w-1/2 mx-auto my-8 p-6 space-y-4">
            <img src="/images/neural-eth.png" alt="athereum loggo" className="w-48 h-48 mb-4" />
            <h2 className="text-2xl font-bold text-center flex items-center justify-center">
                <FaWallet className="mr-2" />  Wallet
            </h2>

            {!address ? (
                <div className='flex flex-col gap-2 w-full items-center'>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center text-xl gap-2 justify-center w-4/12 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-medium rounded-xl shadow-lg hover:from-violet-700 hover:to-blue-600 transition duration-300 cursor-pointer"
                    >
                        <FaWallet className="" /> <span className='flex flex-row'>Connect</span>
                    </button>
                    <p className="text-gray-600 mt-4 text-sm">
                        Don't have an account?{' '}
                        <NavLink
                            to="/register"
                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                            Click here to register.
                        </NavLink>
                    </p>
                </div>
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

                    {/* User Info Display */}
                    {userInfo && (
                        <div className="w-full mt-4 p-3 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Profile Information</h3>
                            <div className="space-y-1 text-sm">
                                <div><span className="font-medium">Type:</span> {userInfo.UserType || userInfo.usertype || 'Not set'}</div>
                                <div><span className="font-medium">Name:</span> {userInfo.UserName || userInfo.username || 'Not set'}</div>
                                <div><span className="font-medium">Email:</span> {userInfo.Email || userInfo.email || 'Not set'}</div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 w-full">
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg w-1/2 flex items-center justify-center mx-auto"
                        >
                            <FaEdit className="mr-2" /> Update Profile
                        </button>

                        <button
                            onClick={disconnectWallet}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg w-1/2 flex items-center justify-center mx-auto"
                        >
                            <FaWallet className="mr-2" /> Disconnect Wallet
                        </button>
                    </div>
                </div>
            )}

            {/* Wallet Connection Modal */}
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
                            onClick={connectWallet}
                            className="px-4 py-2 bg-transparent border border-gray-300 shadow-lg rounded-lg text-gray-600 w-full flex items-center justify-start gap-4 hover:bg-gray-50 transition-colors"
                        >
                            <FaWallet className="w-8 h-8 text-orange-500" />
                            <span className="text-lg font-medium">MetaMask</span>
                        </button>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg w-full hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Update Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black opacity-50"
                        onClick={() => setIsProfileModalOpen(false)}
                    ></div>

                    <div className="bg-white p-6 rounded-lg relative z-10 w-96 max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Update Profile</h3>
                            <button
                                onClick={() => setIsProfileModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            {/* User Type */}
                            <div>
                                <label htmlFor="UserType" className="block text-xl font-medium text-gray-700 mb-1">
                                    User Type
                                </label>
                                <select
                                    id="UserType"
                                    name="UserType"
                                    value={profileData.UserType}
                                    onChange={handleProfileInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select user type</option>
                                    <option value="Student">Student</option>
                                    <option value="Issuer">Issuer</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* User Name */}
                            <div>
                                <label htmlFor="UserName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="UserName"
                                    name="UserName"
                                    value={profileData.UserName}
                                    onChange={handleProfileInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="Email"
                                    name="Email"
                                    value={profileData.Email}
                                    onChange={handleProfileInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter your email address"
                                />
                            </div>

                            {/* Read-only fields for reference */}
                            <div className="bg-gray-50 p-3 rounded-md">

                                <span className="font-medium">Ethereum Address:</span>
                                <div className="font-mono text-xs break-all">{address}</div>

                            </div>

                            {/* Update Message */}
                            {updateMessage && (
                                <div className={`p-3 rounded-md ${updateMessageType === 'success'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                    <p className="text-sm">{updateMessage}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="mr-2" />
                                            Update Profile
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                                    disabled={isUpdating}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletLogin;
