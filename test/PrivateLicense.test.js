const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateLicense", function () {
    let privateLicense;
    let owner, issuer, student, otherUser;
    let easUID, ipfsCID, proof;

    beforeEach(async function () {
        [owner, issuer, student, otherUser] = await ethers.getSigners();
        
        const PrivateLicense = await ethers.getContractFactory("PrivateLicense");
        privateLicense = await PrivateLicense.deploy();
        await privateLicense.waitForDeployment();

        // Test data
        easUID = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        ipfsCID = "QmTest123456789";
        proof = "proof-data-123";
    });

    describe("Deployment", function () {
        it("Should set the deployer as admin and issuer", async function () {
            expect(await privateLicense.getRole(owner.address)).to.equal("Admin");
            expect(await privateLicense.hasRole(await privateLicense.ISSUER_ROLE(), owner.address)).to.be.true;
        });

        it("Should emit IssuerAdded event on deployment", async function () {
            const PrivateLicense = await ethers.getContractFactory("PrivateLicense");
            const deployTx = await PrivateLicense.deploy();
            
            await expect(deployTx.deploymentTransaction())
                .to.emit(deployTx, "IssuerAdded")
                .withArgs(owner.address);
        });
    });

    describe("Access Control", function () {
        it("Should add issuer by admin", async function () {
            await expect(privateLicense.addIssuer(issuer.address))
                .to.emit(privateLicense, "IssuerAdded")
                .withArgs(issuer.address);
            
            expect(await privateLicense.getRole(issuer.address)).to.equal("Issuer");
        });

        it("Should remove issuer by admin", async function () {
            await privateLicense.addIssuer(issuer.address);
            
            await expect(privateLicense.removeIssuer(issuer.address))
                .to.emit(privateLicense, "IssuerRemoved")
                .withArgs(issuer.address);
            
            expect(await privateLicense.getRole(issuer.address)).to.equal("User");
        });

        it("Should not allow non-admin to add issuer", async function () {
            await expect(privateLicense.connect(student).addIssuer(issuer.address))
                .to.be.reverted;
        });

        it("Should not allow non-admin to remove issuer", async function () {
            await privateLicense.addIssuer(issuer.address);
            await expect(privateLicense.connect(student).removeIssuer(issuer.address))
                .to.be.reverted;
        });

        it("Should return correct role for different users", async function () {
            expect(await privateLicense.getRole(owner.address)).to.equal("Admin");
            expect(await privateLicense.getRole(student.address)).to.equal("User");
            
            await privateLicense.addIssuer(issuer.address);
            expect(await privateLicense.getRole(issuer.address)).to.equal("Issuer");
        });
    });

    describe("License Issuance", function () {
        it("Should issue license successfully", async function () {
            await expect(privateLicense.issueLicense(easUID, ipfsCID, student.address, proof))
                .to.emit(privateLicense, "LicenseIssued")
                .withArgs(easUID, student.address, ipfsCID, proof);

            const license = await privateLicense.licenses(easUID);
            expect(license.ipfsCID).to.equal(ipfsCID);
            expect(license.easUID).to.equal(easUID);
            expect(license.studentDID).to.equal(student.address);
            expect(license.isValid).to.be.true;
            expect(license.proof).to.equal(proof);
        });

        it("Should not allow non-issuer to issue license", async function () {
            await expect(privateLicense.connect(student).issueLicense(easUID, ipfsCID, student.address, proof))
                .to.be.reverted;
        });

        it("Should not issue license with empty EAS UID", async function () {
            await expect(privateLicense.issueLicense("", ipfsCID, student.address, proof))
                .to.be.revertedWith("Invalid EAS UID");
        });

        it("Should not issue license with empty IPFS CID", async function () {
            await expect(privateLicense.issueLicense(easUID, "", student.address, proof))
                .to.be.revertedWith("Invalid ipfsCID");
        });

        it("Should not issue license with zero address", async function () {
            await expect(privateLicense.issueLicense(easUID, ipfsCID, ethers.ZeroAddress, proof))
                .to.be.revertedWith("Invalid student DID");
        });

        it("Should not issue duplicate license with same EAS UID", async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
            
            await expect(privateLicense.issueLicense(easUID, "QmDifferent", otherUser.address, proof))
                .to.be.revertedWith("License already exists");
        });

        it("Should not issue duplicate license with same IPFS CID and DID", async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
            
            const newEasUID = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
            await expect(privateLicense.issueLicense(newEasUID, ipfsCID, student.address, proof))
                .to.be.revertedWith("License with this ipfsCID and DID already exists");
        });

        it("Should update mappings correctly after issuance", async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
            
            expect(await privateLicense.licenseExists(ipfsCID, student.address)).to.be.true;
            
            const studentLicenses = await privateLicense.didToEASUIDs(student.address, 0);
            expect(studentLicenses).to.equal(easUID);
            
            const allLicenses = await privateLicense.easUIDs(0);
            expect(allLicenses).to.equal(easUID);
        });
    });

    describe("License Revocation", function () {
        beforeEach(async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
        });

        it("Should allow license owner to revoke", async function () {
            await expect(privateLicense.connect(student).revokeLicense(easUID))
                .to.emit(privateLicense, "LicenseRevoked")
                .withArgs(easUID, student.address);

            const license = await privateLicense.licenses(easUID);
            expect(license.isValid).to.be.false;
        });

        it("Should allow issuer to revoke", async function () {
            await expect(privateLicense.revokeLicense(easUID))
                .to.emit(privateLicense, "LicenseRevoked")
                .withArgs(easUID, student.address);

            const license = await privateLicense.licenses(easUID);
            expect(license.isValid).to.be.false;
        });

        it("Should not allow unauthorized user to revoke", async function () {
            await expect(privateLicense.connect(otherUser).revokeLicense(easUID))
                .to.be.revertedWith("Not the license owner or issuer");
        });

        it("Should not revoke non-existent license", async function () {
            const fakeUID = "0xfake1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd";
            await expect(privateLicense.revokeLicense(fakeUID))
                .to.be.revertedWith("License does not exist");
        });

        it("Should not revoke already revoked license", async function () {
            await privateLicense.revokeLicense(easUID);
            
            await expect(privateLicense.revokeLicense(easUID))
                .to.be.revertedWith("License already revoked");
        });
    });

    describe("License Verification", function () {
        beforeEach(async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
        });

        it("Should verify valid license", async function () {
            const [isValid, studentDID] = await privateLicense.verifyLicense(easUID);
            expect(isValid).to.be.true;
            expect(studentDID).to.equal(student.address);
        });

        it("Should not verify revoked license", async function () {
            await privateLicense.revokeLicense(easUID);
            
            const [isValid, studentDID] = await privateLicense.verifyLicense(easUID);
            expect(isValid).to.be.false;
            expect(studentDID).to.equal(student.address);
        });

        it("Should not verify non-existent license", async function () {
            const fakeUID = "0xfake1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd";
            const [isValid, studentDID] = await privateLicense.verifyLicense(fakeUID);
            expect(isValid).to.be.false;
            expect(studentDID).to.equal(ethers.ZeroAddress);
        });
    });

    describe("License Details", function () {
        beforeEach(async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
        });

        it("Should get license details", async function () {
            const details = await privateLicense.getLicenseDetails(easUID);
            expect(details[0]).to.equal(ipfsCID); // ipfsCID
            expect(details[1]).to.equal(easUID); // easUID
            expect(details[2]).to.equal(student.address); // studentDID
            expect(details[3]).to.be.true; // isValid
            expect(details[4]).to.be.gt(0); // timestamp
            expect(details[5]).to.equal(proof); // proof
        });
    });

    describe("Get Licenses by DID", function () {
        beforeEach(async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
        });

        it("Should allow license owner to get their licenses", async function () {
            const result = await privateLicense.connect(student).getLicensesByDID(student.address);
            
            expect(result[0][0]).to.equal(easUID); // easUIDs
            expect(result[1][0]).to.equal(ipfsCID); // ipfsCIDs
            expect(result[2][0]).to.be.true; // isValid
            expect(result[3][0]).to.be.gt(0); // timestamps
            expect(result[4][0]).to.equal(proof); // proofs
        });

        it("Should not allow others to get someone else's licenses", async function () {
            await expect(privateLicense.connect(otherUser).getLicensesByDID(student.address))
                .to.be.revertedWith("Only license owner can access their licenses");
        });

        it("Should return multiple licenses for same user", async function () {
            const easUID2 = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
            const ipfsCID2 = "QmTest987654321";
            const proof2 = "proof-data-456";
            
            await privateLicense.issueLicense(easUID2, ipfsCID2, student.address, proof2);
            
            const result = await privateLicense.connect(student).getLicensesByDID(student.address);
            
            expect(result[0].length).to.equal(2);
            expect(result[0]).to.include(easUID);
            expect(result[0]).to.include(easUID2);
        });
    });

    describe("Get All Licenses", function () {
        beforeEach(async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
        });

        it("Should allow issuer to get all licenses", async function () {
            const allLicenses = await privateLicense.getAllLicenses();
            expect(allLicenses.length).to.equal(1);
            expect(allLicenses[0].easUID).to.equal(easUID);
            expect(allLicenses[0].studentDID).to.equal(student.address);
        });

        it("Should not allow non-issuer to get all licenses", async function () {
            await expect(privateLicense.connect(student).getAllLicenses())
                .to.be.reverted;
        });
    });

    describe("License Exists", function () {
        it("Should return false for non-existent license", async function () {
            expect(await privateLicense.licenseExists(ipfsCID, student.address)).to.be.false;
        });

        it("Should return true for existing license", async function () {
            await privateLicense.issueLicense(easUID, ipfsCID, student.address, proof);
            expect(await privateLicense.licenseExists(ipfsCID, student.address)).to.be.true;
        });
    });
});