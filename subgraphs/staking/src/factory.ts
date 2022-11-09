/* eslint-disable prefer-const */
import { log, dataSource } from "@graphprotocol/graph-ts";
import { Factory, Pool } from "../generated/schema";
import { NewStakingContract } from "../generated/StakingFactory/StakingFactory";
import { convertTokenToDecimal, ZERO_BI, ONE_BI } from "./utils";
import { StakingPool as StakingPoolTemplate } from "../generated/templates";
import { getOrCreateToken } from "./utils/kip7";
import {
  fetchEndBlock,
  fetchRewardPerBlock,
  fetchRewardToken,
  fetchStakeToken,
  fetchStartBlock,
  fetchUserLimit,
  fetchNumberBlocksForUserLimit,
  fetchPrecisionFactor,
} from "./utils/pool";

export function handleNewStakingContract(event: NewStakingContract): void {
  let factoryAddress = dataSource.address().toHex()
  let factory = Factory.load(factoryAddress);
  if (factory === null) {
    factory = new Factory(factoryAddress);
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

  let rewardTokenAddress = fetchRewardToken(event.params.staking);
  let rewardToken = getOrCreateToken(rewardTokenAddress);
  
  let pool = new Pool(event.params.staking.toHex()) as Pool;
  pool.stakeToken = stakeToken.id;
  pool.rewardToken = rewardToken.id;
  pool.startBlock = fetchStartBlock(event.params.staking);
  pool.endBlock = fetchEndBlock(event.params.staking);

  pool.lastRewardBlock = pool.startBlock;
  pool.accTokenPerShare = ZERO_BI;
  pool.totalTokensStaked = ZERO_BI;
  pool.harvested = ZERO_BI;

  pool.rewardRate = convertTokenToDecimal(fetchRewardPerBlock(event.params.staking), rewardToken.decimals);
  pool.precisionFactor = fetchPrecisionFactor(event.params.staking);

  let userLimit = fetchUserLimit(event.params.staking);
  if (userLimit.gt(ZERO_BI)) {
    pool.userLimit = userLimit;
    pool.blocksForUserLimit = fetchNumberBlocksForUserLimit(event.params.staking);
  }
  else {
    pool.userLimit = ZERO_BI;
    pool.blocksForUserLimit = ZERO_BI;
  }

  pool.createdAtBlock = event.block.number;
  pool.createdAtTimestamp = event.block.timestamp;
  pool.save();
  StakingPoolTemplate.create(event.params.staking);
  log.info("Pool initialized: {}", [pool.id]);
}