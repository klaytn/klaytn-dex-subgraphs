import { BigInt, ethereum, Address } from "@graphprotocol/graph-ts";
import { Farming } from "../generated/schema";
import { Farming as FarmingContract } from '../generated/Farming/Farming'
import { BI_ZERO, FARMING_ADDRESS } from "./utils";

function fetchFarmingStartBlock(): BigInt {
  let contract = FarmingContract.bind(Address.fromString(FARMING_ADDRESS));
  let startBlock = contract.try_startBlock();
  if (!startBlock.reverted) {
    return startBlock.value;
  }
  return BI_ZERO;
}

function fetchFarmingRewardRate(): BigInt {
  let contract = FarmingContract.bind(Address.fromString(FARMING_ADDRESS));
  let rewardRate = contract.try_ptnPerBlock();
  if (!rewardRate.reverted) {
    return rewardRate.value;
  }
  return BI_ZERO;
}

export function getOrCreateFarming(block: ethereum.Block): Farming {
  let farming = Farming.load(FARMING_ADDRESS);

  if (farming === null) {
    farming = new Farming(FARMING_ADDRESS);
    farming.totalAllocPoint = BI_ZERO;
    farming.rewardRate = fetchFarmingRewardRate();
    farming.startBlock = fetchFarmingStartBlock();
    farming.poolCount = BI_ZERO;
  }

  farming.updatedAtBlock = block.number;
  farming.updatedAtTimestamp = block.timestamp;
  farming.save();

  return farming;
}

