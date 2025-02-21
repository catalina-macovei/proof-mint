import React, { useState, useEffect } from 'react';
import { formatEther, verifyMessage } from 'ethers';
import { getWeb3Provider, agent } from './veramo/setup.js';
import {
  FaWallet,
  FaKey,
  FaCheckCircle,
  FaTimesCircle,
  FaSignature,
  FaEthereum,
  FaFileSignature,
} from 'react-icons/fa';

const MetaMaskLogin = ({ onLogin }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [did, setDid] = useState(null);

  const [message, setMessage] = useState('Hello, Veramo!');
  const [signedMessage, setSignedMessage] = useState(null);
  const [verified, setVerified] = useState(null);

  const [balance, setBalance] = useState(null);

  // State for Verifiable Credentials
  const [issuedVC, setIssuedVC] = useState(null);
  const [vcVerified, setVcVerified] = useState(null);

  useEffect(() => {
    const storedAddress = sessionStorage.getItem('walletAddress');
    const storedDid = sessionStorage.getItem('did');
    if (storedAddress) {
      setWalletAddress(storedAddress);
      setDid(storedDid);
      fetchBalance(storedAddress);
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }
      const provider = getWeb3Provider();
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log('Connected address:', address);

      // Create or retrieve DID using Veramo
      const identifier = await agent.didManagerCreate({
        provider: 'did:ethr',
        alias: address,
      });

      setWalletAddress(address);
      sessionStorage.setItem('walletAddress', address);

      setDid(identifier.did);
      sessionStorage.setItem('did', identifier.did);

      onLogin?.(address, identifier.did);
      fetchBalance(address);
    } catch (error) {
      console.error('MetaMask connection failed:', error);
    }
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

  /** --------------------------
   *  SIGN & VERIFY MESSAGE
   * ---------------------------*/
  const signMessage = async () => {
    if (!walletAddress) return;
    try {
      const provider = getWeb3Provider();
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      setSignedMessage(signature);
      setVerified(null);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  const verifyMessageHandler = async () => {
    if (!signedMessage) return;
    try {
      const recoveredAddress = verifyMessage(message, signedMessage);
      setVerified(recoveredAddress === walletAddress);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerified(false);
    }
  };

  /** --------------------------
   *  ISSUE & VERIFY CREDENTIAL
   * ---------------------------*/
  const issueCredential = async () => {
    if (!did) return;
    try {
      // Create a simple Verifiable Credential (VC) with Veramo
      // You can customize the subject, context, issuanceDate, etc.
      const vc = await agent.createVerifiableCredential({
        credential: {
          issuer: { id: did },
          // This is the W3C standard type array for a credential
          type: ['VerifiableCredential', 'ExampleCredential'],
          issuanceDate: new Date().toISOString(),
          credentialSubject: {
            // Subject could be the same DID or another DID
            id: did,
            name: 'Alice',
            role: 'Demo User',
          },
        },
        proofFormat: 'jwt', // or 'lds' for JSON-LD Signatures
      });

      setIssuedVC(vc);
      setVcVerified(null);
      console.log('Issued VC:', vc);
    } catch (error) {
      console.error('Error issuing VC:', error);
    }
  };

  const verifyCredential = async () => {
    if (!issuedVC) return;
    try {
      const result = await agent.verifyCredential({ credential: issuedVC });
      setVcVerified(result.verified);
      console.log('Verification result:', result);
    } catch (error) {
      console.error('Error verifying VC:', error);
      setVcVerified(false);
    }
  };

  return (
    <div className="w-full max-w-xl md:max-w-2xl mx-auto my-8 p-6 bg-white shadow-lg rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-center flex items-center justify-center">
        <FaWallet className="mr-2" />
        MetaMask Authentication
      </h2>

      {/* If wallet not connected, show the Connect button */}
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
          {/* Wallet Info Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow w-full space-y-2">
            <div className="flex items-center flex-wrap">
              <FaWallet className="mr-2 text-blue-600" />
              <span className="font-semibold">Wallet Address:</span>
              <span className="ml-2 break-all">{walletAddress}</span>
            </div>
            <div className="flex items-center flex-wrap">
              <FaKey className="mr-2 text-green-600" />
              <span className="font-semibold">DID:</span>
              <span className="ml-2 break-all">{did}</span>
            </div>
            {balance && (
              <div className="flex items-center flex-wrap">
                <FaEthereum className="mr-2 text-purple-600" />
                <span className="font-semibold">Balance:</span>
                <span className="ml-2">{balance} ETH</span>
              </div>
            )}
          </div>

          {/* Signing & Verification Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow w-full space-y-4">
            <div>
              <label className="font-semibold block mb-1">Message to Sign</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border p-2 w-full rounded"
                rows={3}
              />
            </div>

            <button
              onClick={signMessage}
              className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center"
            >
              <FaSignature className="mr-2" />
              Sign Message
            </button>

            {signedMessage && (
              <div className="space-y-2">
                <p className="font-semibold">Signature:</p>
                <div className="bg-white p-2 rounded border overflow-x-auto text-sm break-all">
                  {signedMessage}
                </div>
                <button
                  onClick={verifyMessageHandler}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center"
                >
                  Verify Signature
                </button>
                {verified !== null && (
                  <div className="mt-2 flex items-center">
                    {verified ? (
                      <>
                        <FaCheckCircle className="text-green-500 mr-1" />
                        <span className="font-semibold text-green-600">
                          Signature Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="text-red-500 mr-1" />
                        <span className="font-semibold text-red-600">
                          Signature Invalid
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Issue & Verify Verifiable Credential Card */}
          <div className="bg-gray-50 p-4 rounded-lg shadow w-full space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <FaFileSignature className="mr-2 text-blue-600" />
              Issue & Verify Verifiable Credential
            </h3>

            <button
              onClick={issueCredential}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
            >
              Issue Credential
            </button>

            {issuedVC && (
              <div className="space-y-2">
                <p className="font-semibold">Issued Credential (JWT):</p>
                <div className="bg-white p-2 rounded border overflow-x-auto text-sm break-all">
                  {JSON.stringify(issuedVC, null, 2)}
                </div>
                <button
                  onClick={verifyCredential}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center"
                >
                  Verify Credential
                </button>
                {vcVerified !== null && (
                  <div className="mt-2 flex items-center">
                    {vcVerified ? (
                      <>
                        <FaCheckCircle className="text-green-500 mr-1" />
                        <span className="font-semibold text-green-600">
                          Credential Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="text-red-500 mr-1" />
                        <span className="font-semibold text-red-600">
                          Credential Invalid
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MetaMaskLogin;
