// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBalancerVault {
    struct SingleSwap {
        bytes32 poolId;
        uint8 kind; // 0 = GIVEN_IN
        address assetIn;
        address assetOut;
        uint256 amount;
        bytes userData;
    }

    struct FundManagement {
        address sender;
        bool fromInternalBalance;
        address recipient;
        bool toInternalBalance;
    }

    function swap(
        SingleSwap calldata singleSwap,
        FundManagement calldata funds,
        uint256 limit,
        uint256 deadline
    ) external payable returns (uint256);
}

import "./ArbitrageEngine.sol"; // Adjust path if necessary

contract BalancerAdapter is IDexAdapter {

    IBalancerVault public immutable vault;
    bytes32 public immutable poolId;

    constructor(address _vault, bytes32 _poolId) {
        vault = IBalancerVault(_vault);
        poolId = _poolId;
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external override returns (uint256 amountOut) {

        IERC20(tokenIn).approve(address(vault), amountIn);

        IBalancerVault.SingleSwap memory singleSwap = IBalancerVault.SingleSwap({
            poolId: poolId,
            kind: 0, // GIVEN_IN
            assetIn: tokenIn,
            assetOut: tokenOut,
            amount: amountIn,
            userData: bytes("")
        });

        IBalancerVault.FundManagement memory funds = IBalancerVault.FundManagement({
            sender: address(this),
            fromInternalBalance: false,
            recipient: msg.sender,
            toInternalBalance: false
        });

        amountOut = vault.swap(singleSwap, funds, amountOutMin, block.timestamp);
    }
}
