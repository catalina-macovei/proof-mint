import React, { useState, useEffect } from 'react';
import { formatEther, BrowserProvider } from 'ethers';
import {
  FaWallet,
  FaEthereum,
} from 'react-icons/fa';

const MetaMaskLogin = ({ onLogin }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const storedAddress = sessionStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
      fetchBalance(storedAddress);

    }
  }, []);

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
      const provider = getWeb3Provider();
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log('Connected address:', address);

      setWalletAddress(address);
      sessionStorage.setItem('walletAddress', address);
      fetchBalance(address);
      onLogin?.(address);
    } catch (error) {
      console.error('MetaMask connection failed:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance(null);
    sessionStorage.removeItem('walletAddress');
    window.location.reload();
  };


  const fetchBalance = async (address) => {
    try {
      const provider = getWeb3Provider();
      const balance = await provider.getBalance(address);
      const balanceInEther = formatEther(balance.toString());
      setBalance(Number(balanceInEther).toFixed(2));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  return (
    <div className="w-full max-w-xl md:max-w-2xl mx-auto my-8 p-6 bg-white shadow-lg rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-center flex items-center justify-center">
        <FaWallet className="mr-2" />
        MetaMask Authentication
      </h2>

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg w-full flex items-center justify-center"
        >
          <FaWallet className="mr-2" />
          Connect MetaMask
        </button>
      ) : (
        <>
          <div className="bg-gray-50 p-4 rounded-lg shadow w-full space-y-2">
            <div className="flex items-center flex-wrap">
              <FaWallet className="mr-2 text-blue-600" />
              <span className="font-semibold">Wallet Address:</span>
              <span className="ml-2 break-all">{walletAddress}</span>
            </div>
            {balance && (
              <div className="flex items-center flex-wrap">
                <FaEthereum className="mr-2 text-purple-600" />
                <span className="font-semibold">Balance:</span>
                <span className="ml-2">{balance} ETH</span>
              </div>
            )}
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 bg-red-500 text-white rounded-lg w-full flex items-center justify-center mt-2"
            >
              <FaWallet className="mr-2" />
              Disconnect Wallet
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MetaMaskLogin;