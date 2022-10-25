import { Address } from "@graphprotocol/graph-ts";
import {
  Deposit,
  EmergencyWithdraw,
  NewRewardPerBlock,
  NewStartAndEndBlocks,
  Withdraw,
  UpdatePool,
  NewPoolLimit,
  RewardsStop,
} from "../generated/templates/StakingPool/StakingPool";
import { convertTokenToDecimal, ZERO_BI } from "./utils";
import { getOrCreateToken } from "./utils/kip7";
import { getOrCreateUser } from "./utils/user";
import { Pool } from "../generated/schema";

export function handleDeposit(event: Deposit): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  user.stakeToken = pool.stakeToken;
  pool.totalTokensStaked = pool.totalTokensStaked.plus(event.params.amount);
  if (event.block.number.gt(pool.startBlock) && user.amount.gt(ZERO_BI)) {
    const pending = user.amount
      .times(pool.accTokenPerShare)
      .div(pool.precisionFactor)
      .minus(user.rewardDebt)
    if (pending.gt(ZERO_BI)) {
      user.harvested = user.harvested.plus(pending)
      pool.harvested = pool.harvested.plus(pending)
    }
  }
  user.amount = user.amount.plus(event.params.amount);
  user.rewardDebt = user.amount
    .times(pool.accTokenPerShare)
    .div(pool.precisionFactor);

  pool.save();
  user.save();
}

export function handleWithdraw(event: Withdraw): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  pool.totalTokensStaked = pool.totalTokensStaked.minus(event.params.amount);

  if (event.block.number.gt(pool.startBlock) && user.amount.gt(ZERO_BI)) {
    const pending = user.amount
      .times(pool.accTokenPerShare)
      .div(pool.precisionFactor)
      .minus(user.rewardDebt)
    if (pending.gt(ZERO_BI)) {
      user.harvested = user.harvested.plus(pending)
      pool.harvested = pool.harvested.plus(pending)
    }
  }
  user.amount = user.amount.minus(event.params.amount);
  user.rewardDebt = user.amount
    .times(pool.accTokenPerShare)
    .div(pool.precisionFactor);

  pool.save();
  user.save();
}

export function handleUpdatePool(event: UpdatePool): void {
  let pool = Pool.load(event.address.toHex())!;
  pool.lastRewardBlock = event.params.lastRewardBlock;
  pool.accTokenPerShare = event.params.accTokenPerShare;
  pool.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  let user = getOrCreateUser(event.address, event.params.user);
  user.amount = ZERO_BI;
  user.rewardDebt = ZERO_BI;
  user.save();
}

export function handleNewStartAndEndBlocks(event: NewStartAndEndBlocks): void {
  let pool = Pool.load(event.address.toHex())!;
  pool.startBlock = event.params.startBlock;
  pool.endBlock = event.params.endBlock;
  pool.lastRewardBlock = pool.startBlock;
  pool.save();
}

export function handleNewRewardPerBlock(event: NewRewardPerBlock): void {
  let pool = Pool.load(event.address.toHex())!;
  const rewardToken = getOrCreateToken(Address.fromString(pool.rewardToken));
  pool.rewardRate = convertTokenToDecimal(event.params.rewardPerBlock, rewardToken.decimals);
  pool.save();
}

export function handleNewPoolLimit(event: NewPoolLimit): void {
  let pool = Pool.load(event.address.toHex())!;
  pool.userLimit = event.params.poolLimitPerUser;
  pool.save();
}

export function handleRewardsStop(event: RewardsStop): void {
  let pool = Pool.load(event.address.toHex())!;
  pool.lastRewardBlock = event.params.blockNumber;
  pool.save();
}