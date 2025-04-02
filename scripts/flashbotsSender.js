// scripts/flashbotsSender.js
require("dotenv").config();
const { ethers } = require("ethers");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ENGINE_ABI = [
    "function executeFlashLoan(address token, uint256 amount) external"
];

const engine = new ethers.Contract(process.env.ENGINE_ADDRESS, ENGINE_ABI, wallet);

async function main() {
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, wallet);

    console.log("[FLASHBOTS] Starting private bundle sender");

    const token = process.env.USDT;
    const amount = ethers.utils.parseUnits("1000", 6);

    const tx = await engine.populateTransaction.executeFlashLoan(token, amount);

    const bundle = await flashbotsProvider.signBundle([
        { signer: wallet, transaction: tx }
    ]);

    const blockNumber = await provider.getBlockNumber();

    const simulation = await flashbotsProvider.simulate(bundle, blockNumber + 1);
    if (simulation.firstRevert) {
        console.error("[FLASHBOTS] Simulation failed:", simulation.firstRevert);
        return;
    }

    const bundleResponse = await flashbotsProvider.sendRawBundle(bundle, blockNumber + 1);

    if (bundleResponse.error) {
        console.error("[FLASHBOTS] Bundle error:", bundleResponse.error.message);
    } else {
        console.log("[FLASHBOTS] Bundle submitted to Flashbots Relay");
    }
}

main().catch(console.error);
