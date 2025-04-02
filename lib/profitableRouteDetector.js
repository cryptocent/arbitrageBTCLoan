// lib/profitableRouteDetector.js
const { getUniswapQuote, getCurveQuote } = require("./priceOracles");
const { ethers } = require("ethers");

// Basic profitable route detector (simplified)
async function detectArbitrage(provider, params) {
    const {
        tokenIn,
        tokenMid,
        tokenOut,
        amountIn,
        uniswapQuoter,
        curvePool
    } = params;

    // Step 1: Get Uniswap quote (tokenIn -> tokenMid)
    const uniswapOut = await getUniswapQuote(provider, uniswapQuoter, tokenIn, tokenMid, amountIn);

    // Step 2: Get Curve quote (tokenMid -> tokenOut)
    const curveOut = await getCurveQuote(provider, curvePool, 0, 1, uniswapOut);

    console.log("Uniswap Output:", ethers.utils.formatUnits(uniswapOut, 18));
    console.log("Curve Output:", ethers.utils.formatUnits(curveOut, 18));

    // Step 3: Check if profitable (>0.5% gain)
    const isProfitable = curveOut.gt(amountIn.mul(10050).div(10000));

    if (isProfitable) {
        return {
            profitable: true,
            route: [
                {
                    dex: process.env.UNISWAP_ADAPTER,
                    tokenIn: tokenIn,
                    tokenOut: tokenMid,
                    minAmountOut: uniswapOut.mul(99).div(100)
                },
                {
                    dex: process.env.CURVE_ADAPTER,
                    tokenIn: tokenMid,
                    tokenOut: tokenOut,
                    minAmountOut: curveOut.mul(99).div(100)
                }
            ]
        };
    } else {
        return { profitable: false };
    }
}

// Wrapper to quickly build optimal route externally
async function buildOptimalRoute() {
    // Mock parameters (replace with live config)
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC);
    const params = {
        tokenIn: process.env.USDT,
        tokenMid: process.env.DAI,
        tokenOut: process.env.USDT,
        amountIn: ethers.utils.parseUnits("1000", 6),
        uniswapQuoter: process.env.UNISWAP_QUOTER,
        curvePool: process.env.CURVE_POOL
    };
    const result = await detectArbitrage(provider, params);
    return result.profitable ? result.route : [];
}

module.exports = {
    detectArbitrage,
    buildOptimalRoute
};
