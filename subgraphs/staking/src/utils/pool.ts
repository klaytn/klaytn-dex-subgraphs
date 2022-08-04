/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { StakingPool as StakingPoolContract } from "../../generated/templates/StakingPool/StakingPool";
import { ZERO_BI } from "./index";

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function fetchStakeToken(poolAddress: Address): Address {
  let contract = StakingPoolContract.bind(poolAddress);
  let nameValue = Address.fromString(ADDRESS_ZERO);
  let nameResult = contract.try_pool();
  if (!nameResult.reverted) {
    nameValue = nameResult.value.value1;
  }

  return nameValue;
}

export function fetchRewardToken(poolAddress: Address): Address {
  let contract = StakingPoolContract.bind(poolAddress);
  let nameValue = Address.fromString(ADDRESS_ZERO);
  let nameResult = contract.try_pool();
  if (!nameResult.reverted) {
    nameValue = nameResult.value.value3;
  }

  return nameValue;
}

export function fetchStartBlock(poolAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(poolAddress);
  let decimalValue = ZERO_BI;
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value4;
  }
  return decimalValue;
}

export function fetchEndBlock(poolAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(poolAddress);
  let decimalValue = ZERO_BI;
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value5;
  }
  return decimalValue;
}

export function fetchRewardPerBlock(poolAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(poolAddress);
  let decimalValue = ZERO_BI;
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value10;
  }
  return decimalValue;
}

export function fetchUserLimit(poolAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(poolAddress);
  let decimalValue = ZERO_BI;
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value8;
  }
  return decimalValue;
}

export function fetchNumberBlocksForUserLimit(poolAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(poolAddress);
  let decimalValue = ZERO_BI;
  let decimalResult = contract.try_pool();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value.value7;
  }
  return decimalValue;
}

export function fetchPrecisionFactor(poolAddress: Address): BigInt {
  let contract = StakingPoolContract.bind(poolAddress);
  let decimalValue = ZERO_BI;
  let decimalResult = contract.try_PRECISION_FACTOR();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return decimalValue;
}