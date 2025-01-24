import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      return accounts[0];
    } catch (error) {
      throw new Error("User rejected connection");
    }
  } else {
    throw new Error("Please install MetaMask");
  }
};

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error("Please install MetaMask");
};

export const getContract = async (address, abi) => {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};
