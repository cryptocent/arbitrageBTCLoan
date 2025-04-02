// lib/gasBiddingStrategy.js
const { ethers } = require("ethers");

// Compute competitive gas fees for Flashbots bundles
async function computeGasFees(provider) {
    const block = await provider.getBlock("latest");
    const baseFee = block.baseFeePerGas;

    // Priority fee adjustment (adaptive)
    let priorityFee = ethers.utils.parseUnits("2", "gwei");
    if (baseFee.gt(ethers.utils.parseUnits("50", "gwei"))) {
        priorityFee = ethers.utils.parseUnits("3", "gwei");
    }

    // Conservative strategy: maxFeePerGas = baseFee * 2 + priorityFee
    const maxFee = baseFee.mul(2).add(priorityFee);

    return {
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee
    };
}

module.exports = { computeGasFees };
