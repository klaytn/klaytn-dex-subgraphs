import { BigInt, ethereum, Address } from "@graphprotocol/graph-ts";
import { Pool } from "../generated/schema";
import { ADDRESS_ZERO, BI_ZERO } from "./utils";
import { getOrCreateFarming } from "./farmingUpdates";

export function getOrCreatePool(pid: BigInt, block: ethereum.Block, farmingAddress: Address): Pool {
  const farming = getOrCreateFarming(block, farmingAddress);

  let pool = Pool.load(pid.toString());

  if (pool === null) {
    pool = new Pool(pid.toString());
    pool.farming = farming.id;
    pool.pair = ADDRESS_ZERO;
    pool.allocPoint = BI_ZERO;
    pool.lastRewardBlock = (block.number).gt(farming.startBlock) ? block.number : farming.startBlock;
    pool.accPtnPerShare = BI_ZERO;
    pool.totalTokensStaked = BI_ZERO;
    pool.bonusMultiplier = BI_ZERO;
    pool.bonusEndBlock = BI_ZERO;
    pool.userCount = BI_ZERO;
    pool.totalUsersCount = BI_ZERO;
    pool.harvested = BI_ZERO;
    pool.createdAtBlock = block.number;
  }

  pool.updatedAtBlock = block.number;
  pool.updatedAtTimestamp = block.timestamp;
  pool.save();

  return pool;
}