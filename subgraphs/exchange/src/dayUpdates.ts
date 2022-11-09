/* eslint-disable prefer-const */
import { BigInt, ethereum, BigDecimal } from "@graphprotocol/graph-ts";
import { Pair, Token, Factory, FactoryDayData, PairDayData, PairHourData, TokenDayData, Bundle } from "../generated/schema";
import { ONE_BI, ZERO_BD, ZERO_BI } from "./utils";
import { KlayOracleAddress } from "./utils/config";

export function updateFactoryDayData(event: ethereum.Event, factoryAddress: string): FactoryDayData {
  let factory = Factory.load(factoryAddress) as Factory;
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let factoryDayData = FactoryDayData.load(dayID.toString());

  if (factoryDayData === null) {
    factoryDayData = new FactoryDayData(dayID.toString());
    factoryDayData.timestamp = dayStartTimestamp;
    factoryDayData.dailyVolumeUSD = ZERO_BD;
    factoryDayData.dailyVolumeKLAY = ZERO_BD;
    factoryDayData.totalVolumeUSD = ZERO_BD;
    factoryDayData.totalVolumeKLAY = ZERO_BD;
    factoryDayData.dailyVolumeUntracked = ZERO_BD;
  }

  factoryDayData.totalLiquidityUSD = factory.totalLiquidityUSD
  factoryDayData.totalLiquidityKLAY = factory.totalLiquidityKLAY
  factoryDayData.totalTransactions = factory.totalTransactions;
  factoryDayData.save();

  return factoryDayData as FactoryDayData;
}

export function updatePairDayData(event: ethereum.Event): PairDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayPairID = event.address.toHex().concat("-").concat(BigInt.fromI32(dayID).toString());
  let pair = Pair.load(event.address.toHex()) as Pair;
  let pairDayData = PairDayData.load(dayPairID);

  if (pairDayData === null) {
    pairDayData = new PairDayData(dayPairID);
    pairDayData.timestamp = dayStartTimestamp;
    pairDayData.pair = event.address.toHex();
    pairDayData.volumeToken0 = ZERO_BD;
    pairDayData.volumeToken1 = ZERO_BD;
    pairDayData.volumeUSD = ZERO_BD
    pairDayData.totalTransactions = ZERO_BI;
  }

  pairDayData.totalSupply = pair.totalSupply;
  pairDayData.reserve0 = pair.reserve0;
  pairDayData.reserve1 = pair.reserve1;
  pairDayData.reserveUSD = pair.reserveUSD;
  pairDayData.totalTransactions = pairDayData.totalTransactions.plus(ONE_BI);
  pairDayData.save();

  return pairDayData as PairDayData;
}

export function updatePairHourData(event: ethereum.Event): PairHourData {
  let timestamp = event.block.timestamp.toI32();
  let hourIndex = timestamp / 3600;
  let hourStartUnix = hourIndex * 3600;
  let hourPairID = event.address.toHex().concat("-").concat(BigInt.fromI32(hourIndex).toString());
  let pair = Pair.load(event.address.toHex()) as Pair;
  let pairHourData = PairHourData.load(hourPairID);

  if (pairHourData === null) {
    pairHourData = new PairHourData(hourPairID);
    pairHourData.timestamp = hourStartUnix;
    pairHourData.pair = event.address.toHex();
    pairHourData.volumeToken0 = ZERO_BD;
    pairHourData.volumeToken1 = ZERO_BD;
    pairHourData.volumeUSD = ZERO_BD
    pairHourData.totalTransactions = ZERO_BI;
  }

  pairHourData.totalSupply = pair.totalSupply;
  pairHourData.reserve0 = pair.reserve0;
  pairHourData.reserve1 = pair.reserve1;
  pairHourData.reserveUSD = pair.reserveUSD;
  pairHourData.totalTransactions = pairHourData.totalTransactions.plus(ONE_BI);
  pairHourData.save();

  return pairHourData as PairHourData;
}

export function updateTokenDayData(token: Token, event: ethereum.Event): TokenDayData {
  let bundle = Bundle.load(KlayOracleAddress)!;
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let tokenDayID = token.id.toString().concat("-").concat(BigInt.fromI32(dayID).toString());
  let tokenDayData = TokenDayData.load(tokenDayID);

  if (tokenDayData === null) {
    tokenDayData = new TokenDayData(tokenDayID);
    tokenDayData.timestamp = dayStartTimestamp;
    tokenDayData.token = token.id;
    tokenDayData.priceUSD = token.derivedKLAY.times(bundle.klayPrice)
    tokenDayData.dailyVolumeToken = ZERO_BD;
    tokenDayData.dailyVolumeKLAY = ZERO_BD;
    tokenDayData.dailyVolumeUSD = ZERO_BD;
    tokenDayData.totalTransactions = ZERO_BI;
    tokenDayData.totalLiquidityUSD = ZERO_BD;
  }
  tokenDayData.priceUSD = token.derivedKLAY.times(bundle.klayPrice)
  tokenDayData.totalLiquidityToken = token.totalLiquidity;
  tokenDayData.totalLiquidityKLAY = token.totalLiquidity.times(token.derivedKLAY as BigDecimal);
  tokenDayData.totalLiquidityUSD = tokenDayData.totalLiquidityKLAY.times(bundle.klayPrice)
  tokenDayData.totalTransactions = tokenDayData.totalTransactions.plus(ONE_BI);
  tokenDayData.save();

  return tokenDayData as TokenDayData;
}
