import { ethers } from 'hardhat';
import { LicenseManager__factory } from '../../typechain-types';

class BlockchainService {
    constructor() {
        this.contract = LicenseManager__factory.connect(
            process.env.CONTRACT_ADDRESS,
            new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL)
        );
    }

    async issueLicense(cid, studentDID) {
        const tx = await this.contract.issueLicense(cid, studentDID);
        await tx.wait();
        return tx.hash;
    }
}

export default new BlockchainService();
