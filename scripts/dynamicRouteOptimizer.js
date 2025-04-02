// scripts/dynamicRouteOptimizer.js
require("dotenv").config();
const { ethers } = require("ethers");
const { buildOptimalRoute } = require("../lib/profitableRouteDetector");

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ENGINE_ABI = [
    "function setStrategy((address dex, address tokenIn, address tokenOut, uint256 minAmountOut)[]) external"
];
const engine = new ethers.Contract(process.env.ENGINE_ADDRESS, ENGINE_ABI, wallet);

async function main() {
    console.log("[OPTIMIZER] Building and submitting dynamic route...");

    const route = await buildOptimalRoute();
    if (!route || route.length === 0) {
        console.log("[OPTIMIZER] No route generated.");
        return;
    }

    const tx = await engine.setStrategy(route);
    console.log("[OPTIMIZER] Strategy set TX Hash:", tx.hash);
    await tx.wait();
    console.log("[OPTIMIZER] Strategy successfully updated.");
}

main().catch(console.error);
