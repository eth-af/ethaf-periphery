import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from '@ethaf/ethaf-core/artifacts/contracts/EthAfFactory.sol/EthAfFactory.json'
import {
  abi as SWAP_FEE_DISTRIBUTOR_ABI,
  bytecode as SWAP_FEE_DISTRIBUTOR_BYTECODE,
} from '@ethaf/ethaf-core/artifacts/contracts/EthAfSwapFeeDistributor.sol/EthAfSwapFeeDistributor.json'
import {
  abi as ACTIONS_MODULE_ABI,
  bytecode as ACTIONS_MODULE_BYTECODE,
} from '@ethaf/ethaf-core/artifacts/contracts/modules/EthAfPoolActionsModule.sol/EthAfPoolActionsModule.json'
import {
  abi as COLLECT_MODULE_ABI,
  bytecode as COLLECT_MODULE_BYTECODE,
} from '@ethaf/ethaf-core/artifacts/contracts/modules/EthAfPoolCollectModule.sol/EthAfPoolCollectModule.json'
import {
  abi as PROTOCOL_FEE_MODULE_ABI,
  bytecode as PROTOCOL_FEE_MODULE_BYTECODE,
} from '@ethaf/ethaf-core/artifacts/contracts/modules/EthAfPoolProtocolFeeModule.sol/EthAfPoolProtocolFeeModule.json'
import {
  abi as DEPLOYER_MODULE_ABI,
  bytecode as DEPLOYER_MODULE_BYTECODE,
} from '@ethaf/ethaf-core/artifacts/contracts/modules/EthAfPoolDeployerModule.sol/EthAfPoolDeployerModule.json'
import { abi as FACTORY_V2_ABI, bytecode as FACTORY_V2_BYTECODE } from '@uniswap/v2-core/build/UniswapV2Factory.json'
import { Fixture } from 'ethereum-waffle'
import { ethers, waffle } from 'hardhat'
import { IEthAfFactory, IWETH9, MockTimeSwapRouter, MockBlast, MockBlastPoints } from '../../typechain'

import WETH9 from '../contracts/WETH9.json'
import { Contract } from '@ethersproject/contracts'
import { Wallet, constants } from 'ethers'

const wethFixture: Fixture<{ weth9: IWETH9 }> = async ([wallet]) => {
  const weth9 = (await waffle.deployContract(wallet, {
    bytecode: WETH9.bytecode,
    abi: WETH9.abi,
  })) as IWETH9

  return { weth9 }
}

export const v2FactoryFixture: Fixture<{ factory: Contract }> = async ([wallet]) => {
  const factory = await waffle.deployContract(
    wallet,
    {
      bytecode: FACTORY_V2_BYTECODE,
      abi: FACTORY_V2_ABI,
    },
    [constants.AddressZero]
  )

  return { factory }
}

export const ethafRouterFixture: Fixture<{
  weth9: IWETH9
  factory: IEthAfFactory
  router: MockTimeSwapRouter
  mockBlast: MockBlast
  mockBlastPoints: MockBlastPoints
  gasCollector: string
  pointsOperator: string
}> = async ([wallet], provider) => {
  const { weth9 } = await wethFixture([wallet], provider)

  const mockBlastFactory = await ethers.getContractFactory('MockBlast')
  const mockBlast = (await mockBlastFactory.deploy()) as MockBlast
  const mockBlastPointsFactory = await ethers.getContractFactory('MockBlastPoints')
  const mockBlastPoints = (await mockBlastPointsFactory.deploy()) as MockBlastPoints

  const gasCollector = wallet.address
  const pointsOperator = wallet.address

  const poolDeployerModule = await waffle.deployContract(
    wallet,
    {
      bytecode: DEPLOYER_MODULE_BYTECODE,
      abi: DEPLOYER_MODULE_ABI,
    },
    [mockBlast.address, mockBlastPoints.address, gasCollector, pointsOperator]
  )

  const poolActionsModule = await waffle.deployContract(
    wallet,
    {
      bytecode: ACTIONS_MODULE_BYTECODE,
      abi: ACTIONS_MODULE_ABI,
    },
    [mockBlast.address, mockBlastPoints.address, gasCollector, pointsOperator]
  )

  const poolCollectModule = await waffle.deployContract(
    wallet,
    {
      bytecode: COLLECT_MODULE_BYTECODE,
      abi: COLLECT_MODULE_ABI,
    },
    [mockBlast.address, mockBlastPoints.address, gasCollector, pointsOperator]
  )

  const poolProtocolModule = await waffle.deployContract(
    wallet,
    {
      bytecode: PROTOCOL_FEE_MODULE_BYTECODE,
      abi: PROTOCOL_FEE_MODULE_ABI,
    },
    [mockBlast.address, mockBlastPoints.address, gasCollector, pointsOperator]
  )

  const factory = (await waffle.deployContract(
    wallet,
    {
      bytecode: FACTORY_BYTECODE,
      abi: FACTORY_ABI,
    },
    [poolDeployerModule.address, poolActionsModule.address, poolCollectModule.address, poolProtocolModule.address, mockBlast.address, mockBlastPoints.address, gasCollector, pointsOperator]
  )) as IEthAfFactory

  const swapFeeDistributor = await waffle.deployContract(
    wallet,
    {
      bytecode: SWAP_FEE_DISTRIBUTOR_BYTECODE,
      abi: SWAP_FEE_DISTRIBUTOR_ABI,
    },
    [factory.address, mockBlast.address, mockBlastPoints.address, gasCollector, pointsOperator]
  )

  await factory.setSwapFeeDistributor(swapFeeDistributor.address)

  const router = (await (await ethers.getContractFactory('MockTimeSwapRouter')).deploy(
    factory.address,
    weth9.address,
    mockBlast.address,
    mockBlastPoints.address,
    gasCollector,
    pointsOperator
  )) as MockTimeSwapRouter

  return { factory, weth9, router, mockBlast, mockBlastPoints, gasCollector, pointsOperator }
}
