// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;
pragma abicoder v2;

import '@ethaf/ethaf-core/contracts/interfaces/IEthAfPool.sol';
import '../lens/TickLens.sol';

/// @title Tick Lens contract
contract TickLensTest is TickLens {

    constructor(
        address blast,
        address blastPoints,
        address gasCollector,
        address pointsOperator
    ) TickLens(blast, blastPoints, gasCollector, pointsOperator) {}

    function getGasCostOfGetPopulatedTicksInWord(address pool, int16 tickBitmapIndex) external view returns (uint256) {
        uint256 gasBefore = gasleft();
        getPopulatedTicksInWord(pool, tickBitmapIndex);
        return gasBefore - gasleft();
    }
}
