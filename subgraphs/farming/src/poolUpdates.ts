import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Pool } from "../generated/schema";
import { ADDRESS_ZERO, BI_ZERO } from "./utils";
import { getOrCreateFarming } from "./farmingUpdates";

export function getOrCreatePool(pid: BigInt, block: ethereum.Block): Pool {
  const farming = getOrCreateFarming(block);

  let pool = Pool.load(pid.toString());

  if (pool === null) {
    pool = new Pool(pid.toString());
    pool.farming = farming.id;
    pool.pair = ADDRESS_ZERO;
    pool.allocPoint = BI_ZERO;
    pool.lastRewardBlock = BI_ZERO;
    pool.accPtnPerShare = BI_ZERO;
    pool.totalTokensStaked = BI_ZERO;
    pool.bonusMultiplier = BI_ZERO;
    pool.bonusEndBlock = BI_ZERO;
    pool.userCount = BI_ZERO;
    pool.totalUsersCount = BI_ZERO;
  }

  pool.timestamp = block.timestamp;
  pool.block = block.number;
  pool.lastRewardBlock = block.number;
  pool.save();

  return pool as Pool;
}