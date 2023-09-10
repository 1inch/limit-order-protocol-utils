// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ITakerInteraction.sol";
import "../interfaces/IOrderMixin.sol";
import "../interfaces/IOrderMixin.sol";
import "../libraries/TakerTraitsLib.sol";

contract RecursiveMatcher is ITakerInteraction {
    bytes1 private constant _FINALIZE_INTERACTION = 0x01;

    error IncorrectCalldataParams();
    error FailedExternalCall(bytes reason);

    function matchOrders(
        IOrderMixin orderMixin,
        IOrderMixin.Order calldata order,
        bytes32 r,
        bytes32 vs,
        uint256 amount,
        TakerTraits takerTraits,
        bytes calldata interaction
    ) external {
        orderMixin.fillOrderTo(
            order,
            r,
            vs,
            amount,
            takerTraits,
            address(this),
            interaction
        );
    }

    function takerInteraction(
        IOrderMixin.Order calldata /* order */,
        bytes32 /* orderHash */,
        bytes calldata /* extension */,
        address /* taker */,
        uint256 /* makingAmount */,
        uint256 /* takingAmount */,
        uint256 /* remainingMakingAmount */,
        bytes calldata extraData
    ) external returns(uint256 offeredTakingAmount) {
        if(extraData[0] & _FINALIZE_INTERACTION != 0x0) {
            (
                address[] memory targets,
                bytes[] memory calldatas
            ) = abi.decode(extraData[1:], (address[], bytes[]));

            if (targets.length != calldatas.length) revert IncorrectCalldataParams();
            for (uint256 i = 0; i < targets.length; i++) {
                // solhint-disable-next-line avoid-low-level-calls
                (bool success, bytes memory reason) = targets[i].call(calldatas[i]);
                if(!success) revert FailedExternalCall(reason);
            }
        } else {
            // solhint-disable-next-line avoid-low-level-calls
            (bool success, bytes memory reason) = msg.sender.call(
                abi.encodePacked(IOrderMixin.fillOrderTo.selector, extraData[1:])
            );
            if (!success) revert FailedExternalCall(reason);
        }
        return 0;
    }
}
