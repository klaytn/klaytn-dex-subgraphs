/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { StakingPool as StakingPoolContract } from "../../generated/templates/StakingPool/StakingPool";
import { Pool } from "../../generated/schema";

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function fetchStakeToken(smartChefAddress: Address): Address {
  let contract = StakingPoolContract.bind(smartChefAddress);
  let nameValue = Address.fromString(ADDRESS_ZERO);
  let nameResult = contract.try_pool();
  if (!nameResult.reverted) {
    nameValue = nameResult.value.value1;
  }

  return nameValue;
}

export function fetchRewardToken(smartChefAddress: Address): Address {
  let contract = StakingPoolContract.bind(smartChefAddress);
  let nameValue = Address.fromString(ADDRESS_ZERO);
  let nameResult = contract.try_pool();
  if (!nameResult.reverted) {
    nameValue = nameResult.value.value3;
  }

  return nameValue;
}

export function fetchStartBlock(smartChefAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(smartChefAddress);
  let decimalValue = BigInt.fromI32(0);
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value4;
  }
  return decimalValue;
}

export function fetchEndBlock(smartChefAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(smartChefAddress);
  let decimalValue = BigInt.fromI32(0);
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value5;
  }
  return decimalValue;
}

export function fetchRewardPerBlock(smartChefAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(smartChefAddress);
  let decimalValue = BigInt.fromI32(0);
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value10;
  }
  return decimalValue;
}

export function fetchUserLimit(smartChefAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(smartChefAddress);
  let decimalValue = BigInt.fromI32(0);
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value8;
  }
  return decimalValue;
}