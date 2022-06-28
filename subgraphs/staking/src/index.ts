import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Deposit,
  EmergencyWithdraw,
  NewRewardPerBlock,
  NewStartAndEndBlocks,
  Withdraw,
} from "../generated/templates/StakingPool/StakingPool";
import { convertTokenToDecimal } from "./utils";
import { getOrCreateToken } from "./utils/kip7";
import { getOrCreateUser } from "./utils/user";
import { Pool } from "../generated/schema";

export function handleDeposit(event: Deposit): void {
  let user = getOrCreateUser(event.address, event.params.user);
  let pool = Pool.load(event.address.toHex())!;
  user.stakeToken = pool.stakeToken;
  user.stakeAmount = user.stakeAmount.plus(event.params.amount);
  user.save();
}

export function handleWithdraw(event: Withdraw): void {
  let user = getOrCreateUser(event.address, event.params.user);
  user.stakeAmount = user.stakeAmount.minus(event.params.amount);
  user.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  let user = getOrCreateUser(event.address, event.params.user);
  user.stakeAmount = BigInt.fromI32(0);
  user.save();
}

export function handleNewStartAndEndBlocks(event: NewStartAndEndBlocks): void {
  let pool = Pool.load(event.address.toHex())!;
  pool.startBlock = event.params.startBlock;
  pool.endBlock = event.params.endBlock;
  pool.save();
}

export function handleNewRewardPerBlock(event: NewRewardPerBlock): void {
  let pool = Pool.load(event.address.toHex())!;
  const earnToken = getOrCreateToken(Address.fromString(pool.earnToken));
  pool.reward = convertTokenToDecimal(event.params.rewardPerBlock, earnToken.decimals);
  pool.save();
}