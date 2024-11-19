const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LicenseManager", function () {
  let licenseManager;
  let owner;
  let student;
  const testCID = "QmTest123";

  beforeEach(async function () {
    [owner, student] = await ethers.getSigners();
    
    const LicenseManager = await ethers.getContractFactory("LicenseManager");
    licenseManager = await LicenseManager.deploy();
  });

  describe("License Issuance", function () {
    it("Should issue a new license", async function () {
      await licenseManager.issueLicense(testCID, student.address);
      
      const license = await licenseManager.getLicenseDetails(testCID);
      expect(license.ipfsCID).to.equal(testCID);
      expect(license.studentDID).to.equal(student.address);
      expect(license.isValid).to.be.true;
    });

    it("Should fail if not owner", async function () {
      await expect(
        licenseManager.connect(student).issueLicense(testCID, student.address)
      ).to.be.revertedWithCustomError(licenseManager, "OwnableUnauthorizedAccount");
    });

    it("Should fail if license already exists", async function () {
      await licenseManager.issueLicense(testCID, student.address);
      await expect(
        licenseManager.issueLicense(testCID, student.address)
      ).to.be.revertedWith("License already exists");
    });
  });

  describe("License Verification", function () {
    it("Should verify a valid license", async function () {
      await licenseManager.issueLicense(testCID, student.address);
      const [isValid, studentDID] = await licenseManager.verifyLicense(testCID);
      
      expect(isValid).to.be.true;
      expect(studentDID).to.equal(student.address);
    });
  });

  describe("License Revocation", function () {
    it("Should revoke a license", async function () {
      await licenseManager.issueLicense(testCID, student.address);
      await licenseManager.revokeLicense(testCID);
      
      const [isValid] = await licenseManager.verifyLicense(testCID);
      expect(isValid).to.be.false;
    });
  });
});
