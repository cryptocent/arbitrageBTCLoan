// tests/ArbitrageEngine.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Arbitrage Engine", function () {
    let engine, owner;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        const Engine = await ethers.getContractFactory("ArbitrageEngine");
        engine = await Engine.deploy(owner.address); // Dummy address, adjust if needed
        await engine.deployed();
    });

    it("should deploy successfully", async () => {
        expect(await engine.owner()).to.equal(owner.address);
    });

    it("should revert if no strategy is set", async () => {
        await expect(engine.executeFlashLoan("0x0000000000000000000000000000000000000000", 1000)).to.be.revertedWith("Strategy not configured");
    });

    it("should allow setting a strategy", async () => {
        await engine.setStrategy([]);
        expect(await engine.strategy(0)).to.be.undefined; // Empty strategy
    });
});
