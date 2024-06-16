// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;

import './../interfaces/external/Blast/IBlast.sol';
import './../interfaces/external/Blast/IBlastPoints.sol';


/// @title Blastable
/// @notice An abstract contract that configures the connection to Blast during deployment
/// This involves collecting ETH yield, gas rewards, and Blast Points. ETH yield is earned by this contract automatically, while gas rewards and Blast Points are delegated to dedicated collectors.
abstract contract Blastable {

    /// @notice Sets up the connections to blast
    /// @dev Should only be called once
    /// @param blast The address of the blast gas reward contract.
    /// @param blastPoints The address of the blast points contract.
    /// @param gasCollector The address of the gas collector.
    /// @param pointsOperator The address of the blast points operator.
    function _initBlast(
        address blast,
        address blastPoints,
        address gasCollector,
        address pointsOperator
    ) internal {
        if(blast != address(0)) {
            IBlast(blast).configureClaimableGas();
            if(gasCollector != address(0)) {
                IBlast(blast).configureGovernor(gasCollector);
            }
        }
        if(blastPoints != address(0) && pointsOperator != address(0)) {
            IBlastPoints(blastPoints).configurePointsOperator(pointsOperator);
        }
    }
}
