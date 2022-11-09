/* eslint-disable prefer-const */
import { log, dataSource, DataSourceContext } from "@graphprotocol/graph-ts";
import { Factory, Pair, Token, Bundle } from "../generated/schema";
import { DexPair as PairTemplate } from "../generated/templates";
import { PairCreated } from "../generated/DexFactory/DexFactory";
import {
  ZERO_BD,
  ZERO_BI,
  ONE_BI,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenDecimals,
  fetchTokenTotalSupply,
} from "./utils";
import { KlayOracleAddress } from "./utils/config";

export function handlePairCreated(event: PairCreated): void {
  let factoryAddress = dataSource.address().toHex();
  let factory = Factory.load(factoryAddress);

  if (factory === null) {
    factory = new Factory(factoryAddress);
    factory.totalPairs = ZERO_BI;
    factory.totalTokens = ZERO_BI;
    factory.totalTransactions = ZERO_BI;
    factory.totalVolumeKLAY = ZERO_BD;
    factory.totalLiquidityKLAY = ZERO_BD;
    factory.totalVolumeUSD = ZERO_BD;
    factory.untrackedVolumeUSD = ZERO_BD;
    factory.totalLiquidityUSD = ZERO_BD;

    let bundle = new Bundle(KlayOracleAddress);
    bundle.klayPrice = ZERO_BD;
    bundle.save();
  }

  let token0 = Token.load(event.params.token0.toHex());

  if (token0 === null) {
    token0 = new Token(event.params.token0.toHex());
    token0.name = fetchTokenName(event.params.token0);
    token0.symbol = fetchTokenSymbol(event.params.token0);
    token0.totalSupply = fetchTokenTotalSupply(event.params.token0);
    token0.decimals = fetchTokenDecimals(event.params.token0);
    token0.tradeVolume = ZERO_BD;
    token0.tradeVolumeUSD = ZERO_BD;
    token0.untrackedVolumeUSD = ZERO_BD;
    token0.totalLiquidity = ZERO_BD;
    token0.totalTransactions = ZERO_BI;
    token0.derivedKLAY = ZERO_BD;
    token0.derivedUSD = ZERO_BD;
    token0.save();
  
    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  let token1 = Token.load(event.params.token1.toHex());

  if (token1 === null) {
    token1 = new Token(event.params.token1.toHex());
    token1.name = fetchTokenName(event.params.token1);
    token1.symbol = fetchTokenSymbol(event.params.token1);
    token1.totalSupply = fetchTokenTotalSupply(event.params.token1);
    token1.decimals = fetchTokenDecimals(event.params.token1);
    token1.tradeVolume = ZERO_BD;
    token1.tradeVolumeUSD = ZERO_BD;
    token1.untrackedVolumeUSD = ZERO_BD;
    token1.totalLiquidity = ZERO_BD;
    token1.totalTransactions = ZERO_BI;
    token1.derivedKLAY = ZERO_BD;
    token1.derivedUSD = ZERO_BD;
    token1.save();

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  // Pair
  let pair = new Pair(event.params.pair.toHex()) as Pair;
  pair.name = token0.symbol.concat("-").concat(token1.symbol);
  pair.block = event.block.number;
  pair.timestamp = event.block.timestamp;
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.reserve0 = ZERO_BD;
  pair.reserve1 = ZERO_BD;
  pair.trackedReserveKLAY = ZERO_BD;
  pair.totalSupply = ZERO_BD;
  pair.reserveKLAY = ZERO_BD;
  pair.reserveUSD = ZERO_BD;
  pair.token0Price = ZERO_BD;
  pair.token1Price = ZERO_BD;
  pair.volumeToken0 = ZERO_BD;
  pair.volumeToken1 = ZERO_BD;
  pair.volumeUSD = ZERO_BD;
  pair.untrackedVolumeUSD = ZERO_BD;
  pair.totalTransactions = ZERO_BI;
  pair.liquidityProviderCount = ZERO_BI;
  pair.save();

  // Factory
  factory.totalPairs = factory.totalPairs.plus(ONE_BI);

  // Entities
  factory.save();
  log.info("[Factory] Pool created {} with token0 {} and token1 {}", [
    event.params.pair.toHex(),
    event.params.token0.toHex(),
    event.params.token1.toHex(),
]);
  let context = new DataSourceContext();
  context.setString('DexFactory', factoryAddress)
  PairTemplate.createWithContext(event.params.pair, context);
}
