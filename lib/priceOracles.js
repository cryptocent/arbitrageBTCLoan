// lib/priceOracles.js
const { ethers } = require("ethers");

// Uniswap V3 Quoter ABI
const UNISWAP_QUOTER_ABI = [
    "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"
];

// Curve Pool ABI
const CURVE_POOL_ABI = [
    "function get_dy(int128 i, int128 j, uint256 dx) external view returns (uint256)"
];

// Balancer Vault ABI (simplified for spot price estimation)
const BALANCER_VAULT_ABI = [
    "function getPoolTokenInfo(bytes32 poolId, address token) external view returns (uint256 cash, uint256 managed, uint256 lastChangeBlock, address assetManager)"
];

// -------------------------
// Uniswap V3 Quote Fetcher
// -------------------------
async function getUniswapQuote(provider, quoterAddress, tokenIn, tokenOut, amountIn) {
    const quoter = new ethers.Contract(quoterAddress, UNISWAP_QUOTER_ABI, provider);
    return await quoter.quoteExactInputSingle(tokenIn, tokenOut, 3000, amountIn, 0);
}

// -------------------------
// Curve Pool Quote Fetcher
// -------------------------
async function getCurveQuote(provider, poolAddress, tokenInIndex, tokenOutIndex, amountIn) {
    const pool = new ethers.Contract(poolAddress, CURVE_POOL_ABI, provider);
    return await pool.get_dy(tokenInIndex, tokenOutIndex, amountIn);
}

// -------------------------
// Balancer Spot Liquidity Fetcher
// -------------------------
async function getBalancerLiquidity(provider, vaultAddress, poolId, tokenAddress) {
    const vault = new ethers.Contract(vaultAddress, BALANCER_VAULT_ABI, provider);
    const [cash, managed] = await vault.getPoolTokenInfo(poolId, tokenAddress);
    return cash.add(managed);
}

module.exports = {
    getUniswapQuote,
    getCurveQuote,
    getBalancerLiquidity
};
