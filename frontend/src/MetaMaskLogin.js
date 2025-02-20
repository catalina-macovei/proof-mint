import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getWeb3Provider } from './veramo/setup.js';

const MetaMaskLogin = ({ onLogin }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [did, setDid] = useState(null);
  const [message, setMessage] = useState('Hello, Veramo!');
  const [signedMessage, setSignedMessage] = useState(null);
  const [verified, setVerified] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const storedAddress = sessionStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
      setDid(`did:ethr:${storedAddress}`);
      fetchBalance(storedAddress);
    }
  }, []);

  const connectWallet = async () => {
    try {
      const provider = getWeb3Provider();
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      sessionStorage.setItem('walletAddress', address);
      const newDid = `did:ethr:${address}`;
      setDid(newDid);
      onLogin?.(address, newDid);
      fetchBalance(address);
    } catch (error) {
      console.error('MetaMask connection failed:', error);
    }
  };

  const fetchBalance = async (address) => {
    try {
      const provider = getWeb3Provider();
      const balance = await provider.getBalance(address);
      const balanceInEther = ethers.formatEther(balance.toString());
      const roundedBalance = Number(balanceInEther).toFixed(2);
      setBalance(roundedBalance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const signMessage = async () => {
    try {
      const provider = getWeb3Provider();
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      setSignedMessage(signature);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  const verifySignature = async () => {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signedMessage);
      setVerified(recoveredAddress.toLowerCase() === walletAddress.toLowerCase());
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setDid(null);
    setSignedMessage(null);
    setVerified(null);
    setBalance(null);
    sessionStorage.removeItem('walletAddress');
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">MetaMask Login</h2>

      {!walletAddress ? (
        <div className="flex flex-col items-center">
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Connect MetaMask
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full items-center">
          {/* Account Info Card */}
          <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6 w-full">
            <div className="flex flex-col items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A1 1 0 016 17h12a1 1 0 01.879.516l1.5 2.5A1 1 0 0119.5 22h-15a1 1 0 01-.879-1.484l1.5-2.5zM12 3a4 4 0 110 8 4 4 0 010-8z"
                />
              </svg>
              <p className="break-all">
                <strong>Wallet Address:</strong> {walletAddress}
              </p>
            </div>
            <p className="mb-2 break-all">
              <strong>DID:</strong> {did}
            </p>
            {balance !== null && (
              <p className="mb-2">
                <strong>Balance:</strong> {balance} ETH
              </p>
            )}
            <button
              onClick={disconnectWallet}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg w-full"
            >
              Disconnect
            </button>
          </div>

          {/* Message Signing Card */}
          <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full">
            <h3 className="text-lg text-center font-semibold mb-2">Sign Message</h3>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button
              onClick={signMessage}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg w-full"
            >
              Sign Message
            </button>

            {signedMessage && (
              <>
                <p className="mt-4 break-all">
                  <strong>Signed Message:</strong> {signedMessage}
                </p>
                <button
                  onClick={verifySignature}
                  className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg w-full"
                >
                  Verify Signature
                </button>
              </>
            )}

            {verified !== null && (
              <p
                className={`mt-4 font-bold text-center ${
                  verified ? 'text-green-600' : 'text-red-600'
                }`}
              >
                Signature {verified ? 'is valid ✅' : 'is invalid ❌'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaMaskLogin;
