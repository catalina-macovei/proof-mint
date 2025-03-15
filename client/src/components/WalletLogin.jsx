import React, { useState, useEffect } from 'react';
import { formatEther, BrowserProvider } from 'ethers';
import { FaWallet, FaEthereum } from 'react-icons/fa';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { INFURA_API_KEY, SEPOLIA_RPC_URL } from '../config/contract';
const projectId = 'INFURA_API_KEY'; // Get from WalletConnect Cloud

const WalletLogin = ({ onLogin }) => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (address) {
      sessionStorage.setItem('walletAddress', address);
      fetchBalance(address);
      onLogin?.(address);
    }
  }, [address]);

  const connectWallet = async (walletType) => {
    try {
      let walletProvider;

      if (walletType === 'metamask') {
        if (!window.ethereum) throw new Error('MetaMask not found');
        walletProvider = new BrowserProvider(window.ethereum);
      } else if (walletType === 'coinbase') {
        const coinbaseWallet = new CoinbaseWalletSDK({ appName: 'YourApp' });
        walletProvider = new BrowserProvider(coinbaseWallet.makeWeb3Provider());
      } else if (walletType === 'walletconnect') {
        // WalletConnect v2
        const walletConnectProvider = await EthereumProvider.init({
          projectId: projectId,
          chains: [1], // Chain IDs (1 = Ethereum Mainnet)
          methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData'],
          rpcMap: { 1: SEPOLIA_RPC_URL },
        });

        await walletConnectProvider.enable();
        walletProvider = new BrowserProvider(walletConnectProvider);
      } else {
        throw new Error('Unsupported wallet');
      }

      setProvider(walletProvider);

      // Get signer and address
      const signer = await walletProvider.getSigner();
      const walletAddress = await signer.getAddress();
      setAddress(walletAddress);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const fetchBalance = async (walletAddress) => {
    try {
      if (!provider) return;
      const balance = await provider.getBalance(walletAddress);
      setBalance(Number(formatEther(balance)).toFixed(2));
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
    <div className="w-full max-w-xl md:max-w-2xl mx-auto my-8 p-6 bg-white shadow-lg rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-center flex items-center justify-center">
        <FaWallet className="mr-2" /> Connect Wallet
      </h2>

      {!address ? (
        <div className="space-y-2 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg w-full flex items-center justify-center"
          >
            <FaWallet className="mr-2" /> Connect
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg shadow w-full space-y-2">
          <div className="flex items-center flex-wrap">
            <FaWallet className="mr-2 text-blue-600" />
            <span className="font-semibold">Wallet Address:</span>
            <span className="ml-2 break-all">{address}</span>
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

          <div className="bg-white p-6 rounded-lg relative z-10 space-y-4 w-64">
            <h3 className="text-xl font-bold">Connect Wallet</h3>

            <button
              onClick={() => connectWallet('metamask')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg w-full flex items-center justify-center"
            >
              <FaWallet className="mr-2" /> MetaMask
            </button>

            <button
              onClick={() => connectWallet('walletconnect')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg w-full flex items-center justify-center"
            >
              <FaWallet className="mr-2" /> WalletConnect
            </button>

            <button
              onClick={() => connectWallet('coinbase')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg w-full flex items-center justify-center"
            >
              <FaWallet className="mr-2" /> Coinbase Wallet
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
