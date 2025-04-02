// scripts/searcherBot.js
require("dotenv").config();
const { ethers } = require("ethers");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ENGINE_ABI = [
    "function setStrategy((address dex, address tokenIn, address tokenOut, uint256 minAmountOut)[]) external",
    "function executeFlashLoan(address token, uint256 amount) external"
];
const engine = new ethers.Contract(process.env.ENGINE_ADDRESS, ENGINE_ABI, wallet);

async function main() {
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, wallet);
    console.log("SearcherBot started...");

    while (true) {
        try {
            // Mock profitable opportunity detection (replace with real logic)
            const opportunityDetected = true;

            if (!opportunityDetected) {
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }

            console.log("[SEARCHER] Opportunity detected!");

            // Step 1: Create dynamic strategy
            const route = [
                {
                    dex: process.env.UNISWAP_ADAPTER,
                    tokenIn: process.env.USDT,
                    tokenOut: process.env.DAI,
                    minAmountOut: ethers.utils.parseUnits("0.99", 18)
                },
                {
                    dex: process.env.CURVE_ADAPTER,
                    tokenIn: process.env.DAI,
                    tokenOut: process.env.USDT,
                    minAmountOut: ethers.utils.parseUnits("0.99", 6)
                }
            ];

            // Step 2: Bundle setStrategy + executeFlashLoan in one private transaction
            const tx1 = await engine.populateTransaction.setStrategy(route);
            const tx2 = await engine.populateTransaction.executeFlashLoan(
                process.env.USDT,
                ethers.utils.parseUnits("1000", 6)
            );

            const bundle = await flashbotsProvider.signBundle([
                { signer: wallet, transaction: tx1 },
                { signer: wallet, transaction: tx2 }
            ]);

            const blockNumber = await provider.getBlockNumber();
            const simulation = await flashbotsProvider.simulate(bundle, blockNumber + 1);
            if (simulation.firstRevert) {
                console.log("[SEARCHER] Simulation failed:", simulation.firstRevert);
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }

            const bundleResponse = await flashbotsProvider.sendRawBundle(bundle, blockNumber + 1);
            if (bundleResponse.error) {
                console.log("[SEARCHER] Bundle error:", bundleResponse.error.message);
            } else {
                console.log("[SEARCHER] Bundle submitted to Flashbots");
            }

            await new Promise(r => setTimeout(r, 12000)); // wait for next block

        } catch (err) {
            console.error("[SEARCHER ERROR]:", err);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

main();
