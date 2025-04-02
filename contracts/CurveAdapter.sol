// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICurvePool {
    function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) external returns (uint256);
}

import "./ArbitrageEngine.sol"; // Adjust path if needed

contract CurveAdapter is IDexAdapter {

    ICurvePool public immutable pool;
    int128 public immutable tokenInIndex;
    int128 public immutable tokenOutIndex;

    constructor(address _pool, int128 _tokenInIndex, int128 _tokenOutIndex) {
        pool = ICurvePool(_pool);
        tokenInIndex = _tokenInIndex;
        tokenOutIndex = _tokenOutIndex;
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external override returns (uint256 amountOut) {

        IERC20(tokenIn).approve(address(pool), amountIn);

        amountOut = pool.exchange(tokenInIndex, tokenOutIndex, amountIn, amountOutMin);

        IERC20(tokenOut).transfer(msg.sender, amountOut);
    }
}
