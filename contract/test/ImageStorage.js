const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ImageStorage", function () {
  let contract;

  beforeEach(async function () {
    const Factory = await ethers.getContractFactory("ImageStorage");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  it("should store hash correctly", async function () {
    const cid = "Qm123";
    const hash = ethers.keccak256(ethers.toUtf8Bytes("image"));

    await contract.storeRecord(cid, hash);

    const record = await contract.getRecord(cid);

    expect(record.hash).to.equal(hash);
  });

  it("should verify correct hash", async function () {
    const cid = "Qm123";
    const hash = ethers.keccak256(ethers.toUtf8Bytes("image"));

    await contract.storeRecord(cid, hash);

    const result = await contract.verifyRecord(cid, hash);

    expect(result).to.equal(true);
  });

  it("should reject wrong hash", async function () {
    const cid = "Qm123";
    const hash = ethers.keccak256(ethers.toUtf8Bytes("image"));
    const fakeHash = ethers.keccak256(ethers.toUtf8Bytes("fake"));

    await contract.storeRecord(cid, hash);

    const result = await contract.verifyRecord(cid, fakeHash);

    expect(result).to.equal(false);
  });

  it("should prevent overwrite", async function () {
    const cid = "Qm123";
    const hash = ethers.keccak256(ethers.toUtf8Bytes("image"));

    await contract.storeRecord(cid, hash);

    await expect(contract.storeRecord(cid, hash)).to.be.revertedWith(
      "Already exists",
    );
  });
});
