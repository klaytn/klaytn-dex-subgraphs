/* eslint-disable prefer-const */
import { BigInt, log } from "@graphprotocol/graph-ts";
import { Factory, Pool } from "../generated/schema";
import { NewStakingContract } from "../generated/StakingFactory/StakingFactory";
import { convertTokenToDecimal } from "./utils";
import { StakingPool as StakingPoolTemplate } from "../generated/templates";
import { getOrCreateToken } from "./utils/kip7";
import {
  fetchEndBlock,
  fetchRewardPerBlock,
  fetchRewardToken,
  fetchStakeToken,
  fetchStartBlock,
  fetchUserLimit,
} from "./utils/pool";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let FACTORY_ADDRESS = "0x927158be21fe3d4da7e96931bb27fd5059a8cbc2";

export function handleNewStakingContract(event: NewStakingContract): void {
  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.totalPools = ZERO_BI;
    factory.save();
  }
  factory.totalPools = factory.totalPools.plus(ONE_BI);
  factory.save();

  process(event);
}

function process(event: NewStakingContract): void {
  let stakeTokenAddress = fetchStakeToken(event.params.staking);
  let stakeToken = getOrCreateToken(stakeTokenAddress);

  let earnTokenAddress = fetchRewardToken(event.params.staking);
  let earnToken = getOrCreateToken(earnTokenAddress);
  
  let pool = new Pool(event.params.staking.toHex()) as Pool;
  pool.stakeToken = stakeToken.id;
  pool.earnToken = earnToken.id;
  pool.startBlock = fetchStartBlock(event.params.staking);
  pool.endBlock = fetchEndBlock(event.params.staking);
  pool.reward = convertTokenToDecimal(fetchRewardPerBlock(event.params.staking), earnToken.decimals);

  let userLimit = fetchUserLimit(event.params.staking);
  if (userLimit.gt(ZERO_BI)) {
    pool.limit = convertTokenToDecimal(userLimit, stakeToken.decimals);
  }

  pool.block = event.block.number;
  pool.timestamp = event.block.timestamp;
  pool.save();
  StakingPoolTemplate.create(event.params.staking);
  log.info("Pool initialized: {}", [pool.id]);
}