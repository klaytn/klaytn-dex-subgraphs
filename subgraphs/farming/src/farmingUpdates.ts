import { BigInt, ethereum, Address } from "@graphprotocol/graph-ts";
import { Farming } from "../generated/schema";
import { Farming as FarmingContract } from '../generated/Farming/Farming'
import { BI_ZERO } from "./utils";

function fetchFarmingStartBlock(farmingAddress: Address): BigInt {
  let contract = FarmingContract.bind(farmingAddress);
  let startBlock = contract.try_startBlock();
  if (!startBlock.reverted) {
    return startBlock.value;
  }
  return BI_ZERO;
}

function fetchFarmingRewardRate(farmingAddress: Address): BigInt {
  let contract = FarmingContract.bind(farmingAddress);
  let rewardRate = contract.try_ptnPerBlock();
  if (!rewardRate.reverted) {
    return rewardRate.value;
  }
  return BI_ZERO;
}

export function getOrCreateFarming(block: ethereum.Block, farmingAddress: Address): Farming {
  let farming = Farming.load(farmingAddress.toHex());

  if (farming === null) {
    farming = new Farming(farmingAddress.toHex());
    farming.totalAllocPoint = BI_ZERO;
    farming.rewardRate = fetchFarmingRewardRate(farmingAddress);
    farming.startBlock = fetchFarmingStartBlock(farmingAddress);
    farming.poolCount = BI_ZERO;
  }

  farming.updatedAtBlock = block.number;
  farming.updatedAtTimestamp = block.timestamp;
  farming.save();

  return farming;
}

