const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PublicLicense", function () {
    let publicLicense;
    let owner, issuer, student, otherUser;
    let easUID, ipfsCID;

    beforeEach(async function () {
        [owner, issuer, student, otherUser] = await ethers.getSigners();
        
        const PublicLicense = await ethers.getContractFactory("PublicLicense");
        publicLicense = await PublicLicense.deploy();
        await publicLicense.waitForDeployment();

        // Test data
        easUID = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        ipfsCID = "QmTest123456789";
    });

    describe("Deployment", function () {
        it("Should set the deployer as admin and issuer", async function () {
            expect(await publicLicense.getRole(owner.address)).to.equal("Admin");
            expect(await publicLicense.hasRole(await publicLicense.ISSUER_ROLE(), owner.address)).to.be.true;
        });

        it("Should emit IssuerAdded event on deployment", async function () {
            const PublicLicense = await ethers.getContractFactory("PublicLicense");
            const contract = await PublicLicense.deploy();
            await contract.waitForDeployment();
            // Check that IssuerAdded event was emitted to owner
            const events = await contract.queryFilter(contract.filters.IssuerAdded());
            expect(events.length).to.be.greaterThan(0);
            expect(events[0].args.issuer).to.equal(owner.address);
        });
    });

    describe("Access Control", function () {
        it("Should add issuer by admin", async function () {
            await expect(publicLicense.addIssuer(issuer.address))
                .to.emit(publicLicense, "IssuerAdded")
                .withArgs(issuer.address);
            expect(await publicLicense.getRole(issuer.address)).to.equal("Issuer");
        });

        it("Should remove issuer by admin", async function () {
            await publicLicense.addIssuer(issuer.address);
            await expect(publicLicense.removeIssuer(issuer.address))
                .to.emit(publicLicense, "IssuerRemoved")
                .withArgs(issuer.address);
            expect(await publicLicense.getRole(issuer.address)).to.equal("User");
        });

        it("Should not allow non-admin to add issuer", async function () {
            await expect(publicLicense.connect(student).addIssuer(issuer.address)).to.be.reverted;
        });

        it("Should not allow non-admin to remove issuer", async function () {
            await expect(publicLicense.connect(student).removeIssuer(issuer.address)).to.be.reverted;
        });

        it("Should return correct role for different users", async function () {
            expect(await publicLicense.getRole(owner.address)).to.equal("Admin");
            expect(await publicLicense.getRole(student.address)).to.equal("User");
            await publicLicense.addIssuer(issuer.address);
            expect(await publicLicense.getRole(issuer.address)).to.equal("Issuer");
        });
    });

    describe("License Issuance", function () {
        it("Should issue license successfully", async function () {
            await expect(publicLicense.issueLicense(easUID, ipfsCID, student.address))
                .to.emit(publicLicense, "LicenseIssued")
                .withArgs(easUID, student.address, ipfsCID);
            const license = await publicLicense.licenses(easUID);
            expect(license.ipfsCID).to.equal(ipfsCID);
            expect(license.easUID).to.equal(easUID);
            expect(license.studentDID).to.equal(student.address);
            expect(license.isValid).to.be.true;
        });

        it("Should not allow non-issuer to issue license", async function () {
            await expect(publicLicense.connect(student).issueLicense(easUID, ipfsCID, student.address)).to.be.reverted;
        });

        it("Should not issue license with empty EAS UID", async function () {
            await expect(publicLicense.issueLicense("", ipfsCID, student.address)).to.be.revertedWith("Invalid EAS UID");
        });

        it("Should not issue license with empty IPFS CID", async function () {
            await expect(publicLicense.issueLicense(easUID, "", student.address)).to.be.revertedWith("Invalid ipfsCID");
        });

        it("Should not issue license with zero address", async function () {
            await expect(publicLicense.issueLicense(easUID, ipfsCID, ethers.ZeroAddress)).to.be.revertedWith("Invalid student DID");
        });

        it("Should not issue duplicate license with same EAS UID", async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
            await expect(publicLicense.issueLicense(easUID, "QmDifferent", otherUser.address)).to.be.revertedWith("License already exists");
        });

        it("Should not issue duplicate license with same IPFS CID and DID", async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
            const newEasUID = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
            await expect(publicLicense.issueLicense(newEasUID, ipfsCID, student.address)).to.be.revertedWith("License with this ipfsCID and DID already exists");
        });

        it("Should update mappings correctly after issuance", async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
            expect(await publicLicense.licenseExists(ipfsCID, student.address)).to.be.true;
            expect(await publicLicense.didToEASUIDs(student.address, 0)).to.equal(easUID);
            expect(await publicLicense.easUIDs(0)).to.equal(easUID);
        });
    });

    describe("License Revocation", function () {
        beforeEach(async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
        });

        it("Should allow license owner to revoke", async function () {
            await expect(publicLicense.connect(student).revokeLicense(easUID))
                .to.emit(publicLicense, "LicenseRevoked")
                .withArgs(easUID, student.address);
            expect((await publicLicense.licenses(easUID)).isValid).to.be.false;
        });

        it("Should allow issuer to revoke", async function () {
            await expect(publicLicense.revokeLicense(easUID))
                .to.emit(publicLicense, "LicenseRevoked")
                .withArgs(easUID, student.address);
            expect((await publicLicense.licenses(easUID)).isValid).to.be.false;
        });

        it("Should not allow unauthorized user to revoke", async function () {
            await expect(publicLicense.connect(otherUser).revokeLicense(easUID)).to.be.revertedWith("Not the license owner or issuer");
        });

        it("Should not revoke non-existent license", async function () {
            const fakeUID = "0xfake1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd";
            await expect(publicLicense.revokeLicense(fakeUID)).to.be.revertedWith("License does not exist");
        });

        it("Should not revoke already revoked license", async function () {
            await publicLicense.revokeLicense(easUID);
            await expect(publicLicense.revokeLicense(easUID)).to.be.revertedWith("License already revoked");
        });
    });

    describe("License Verification", function () {
        beforeEach(async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
        });

        it("Should verify valid license", async function () {
            const [isValid, studentDID] = await publicLicense.verifyLicense(easUID);
            expect(isValid).to.be.true;
            expect(studentDID).to.equal(student.address);
        });

        it("Should not verify revoked license", async function () {
            await publicLicense.revokeLicense(easUID);
            const [isValid, studentDID] = await publicLicense.verifyLicense(easUID);
            expect(isValid).to.be.false;
            expect(studentDID).to.equal(student.address);
        });

        it("Should not verify non-existent license", async function () {
            const fakeUID = "0xfake1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd";
            const [isValid, studentDID] = await publicLicense.verifyLicense(fakeUID);
            expect(isValid).to.be.false;
            expect(studentDID).to.equal(ethers.ZeroAddress);
        });
    });

    describe("License Details", function () {
        beforeEach(async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
        });

        it("Should get license details", async function () {
            const details = await publicLicense.getLicenseDetails(easUID);
            expect(details[0]).to.equal(ipfsCID);
            expect(details[1]).to.equal(easUID);
            expect(details[2]).to.equal(student.address);
            expect(details[3]).to.be.true;
            expect(details[4]).to.be.gt(0);
        });
    });

    describe("Get Licenses by DID", function () {
        beforeEach(async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
        });

        it("Should allow license owner to get their licenses", async function () {
            const [uids, cids, valids, timestamps] = await publicLicense.connect(student).getLicensesByDID(student.address);
            expect(uids[0]).to.equal(easUID);
            expect(cids[0]).to.equal(ipfsCID);
            expect(valids[0]).to.be.true;
            expect(timestamps[0]).to.be.gt(0);
        });

        it("Should not allow others to get someone else's licenses", async function () {
            await expect(publicLicense.connect(otherUser).getLicensesByDID(student.address)).to.be.revertedWith("Only license owner can access their licenses");
        });

        it("Should return multiple licenses for same user", async function () {
            const easUID2 = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
            const ipfsCID2 = "QmTest987654321";
            await publicLicense.issueLicense(easUID2, ipfsCID2, student.address);
            const [uids] = await publicLicense.connect(student).getLicensesByDID(student.address);
            expect(uids).to.include.members([easUID, easUID2]);
        });
    });

    describe("Get All Licenses", function () {
        beforeEach(async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
        });

        it("Should allow issuer to get all licenses", async function () {
            const allLicenses = await publicLicense.getAllLicenses();
            expect(allLicenses.length).to.equal(1);
            expect(allLicenses[0].easUID).to.equal(easUID);
            expect(allLicenses[0].studentDID).to.equal(student.address);
        });

        it("Should not allow non-issuer to get all licenses", async function () {
            await expect(publicLicense.connect(student).getAllLicenses()).to.be.reverted;
        });
    });

    describe("License Exists", function () {
        it("Should return false for non-existent license", async function () {
            expect(await publicLicense.licenseExists(ipfsCID, student.address)).to.be.false;
        });

        it("Should return true for existing license", async function () {
            await publicLicense.issueLicense(easUID, ipfsCID, student.address);
            expect(await publicLicense.licenseExists(ipfsCID, student.address)).to.be.true;
        });
    });
});
