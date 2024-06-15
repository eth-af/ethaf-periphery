import { abi as POOL_ABI } from '@ethaf/ethaf-core/artifacts/contracts/EthAfPool.sol/EthAfPool.json'
import { Contract, Wallet } from 'ethers'
import { IEthAfPool } from '../../typechain'

export default function poolAtAddress(address: string, wallet: Wallet): IEthAfPool {
  return new Contract(address, POOL_ABI, wallet) as IEthAfPool
}
