// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IDexAdapter {
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external returns (uint256 amountOut);
}

contract ArbitrageEngine is IFlashLoanSimpleReceiver, Ownable, ReentrancyGuard {

    IPool public immutable pool;

    struct SwapStep {
        address dex;
        address tokenIn;
        address tokenOut;
        uint256 minAmountOut;
    }

    SwapStep[] public strategy;

    event ArbitrageExecuted(uint256 loanAmount, uint256 premium, uint256 profit);

    constructor(address _pool) {
        require(_pool != address(0), "Invalid Pool");
        pool = IPool(_pool);
    }

    function setStrategy(SwapStep[] calldata _steps) external onlyOwner {
        delete strategy;
        for (uint i = 0; i < _steps.length; i++) {
            strategy.push(_steps[i]);
        }
    }

    function executeFlashLoan(address token, uint256 amount) external onlyOwner {
        require(strategy.length > 0, "Strategy not configured");
        pool.flashLoanSimple(address(this), token, amount, bytes(""), 0);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata
    ) external override nonReentrant returns (bool) {
        require(msg.sender == address(pool), "Not Aave Pool");
        require(initiator == address(this), "Not self-initiated");

        uint256 currentAmount = amount;

        for (uint i = 0; i < strategy.length; i++) {
            SwapStep memory step = strategy[i];
            require(IERC20(step.tokenIn).balanceOf(address(this)) >= currentAmount, "Insufficient token for swap");
            IERC20(step.tokenIn).approve(step.dex, currentAmount);
            uint256 output = IDexAdapter(step.dex).swap(
                step.tokenIn,
                step.tokenOut,
                currentAmount,
                step.minAmountOut
            );
            currentAmount = output;
        }

        uint256 totalOwed = amount + premium;
        require(currentAmount >= totalOwed, "Unprofitable arbitrage");

        IERC20(asset).approve(address(pool), totalOwed);

        emit ArbitrageExecuted(amount, premium, currentAmount - totalOwed);

        return true;
    }

    function withdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No funds");
        IERC20(token).transfer(owner(), balance);
    }

    function getMinAmount(uint256 expectedAmount, uint256 slippageBps) public pure returns (uint256) {
        require(slippageBps <= 1000, "Slippage too high");
        return (expectedAmount * (10000 - slippageBps)) / 10000;
    }
}
