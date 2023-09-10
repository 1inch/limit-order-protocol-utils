// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./IOrderMixin.sol";

interface IPreInteraction {
    /**
     * @notice Callback method that gets called before any funds transfers
     * @param order Order being processed
     * @param orderHash Hash of the order being processed
     * @param taker Taker address
     * @param makingAmount Actual making amount
     * @param takingAmount Actual taking amount
     * @param remainingMakingAmount Order remaining making amount
     * @param extraData Extra data
     */
    function preInteraction(
        IOrderMixin.Order calldata order,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) external;
}
