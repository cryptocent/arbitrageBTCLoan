// Real content to be inserted here
// scripts/forkTest.js
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [{
            forking: {
                jsonRpcUrl: process.env.RPC
            }
        }]
    });

    const [deployer] = await ethers.getSigners();
    console.log("Forked network with deployer:", deployer.address);

    // You can now deploy contracts and simulate flashloan cycles locally
}

main().catch(console.error);
