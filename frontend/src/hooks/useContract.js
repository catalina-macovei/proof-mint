import { useState, useEffect } from 'react';
import { getContract } from '../utils/wallet';
import LicenseManager from '../artifacts/contracts/LicenseManager.sol/LicenseManager.json';
import { CONTRACT_ADDRESS } from '../config/contract';


export function useLicenseManager() {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const contract = await getContract(CONTRACT_ADDRESS, LicenseManager.abi);
        setContract(contract);
      } catch (error) {
        console.error('Failed to load contract:', error);
      }
    };
    init();
  }, []);

  return contract;
}
