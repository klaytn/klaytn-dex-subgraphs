/* eslint-disable prefer-const */
import { Factory, Pair, Token, Bundle } from "../generated/schema";
import { Pair as PairTemplate } from "../generated/templates";
import { PairCreated } from "../generated/Factory/Factory";
import {
  FACTORY_ADDRESS,
  KlayOracleAddress,
  ZERO_BD,
  ZERO_BI,
  ONE_BI,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenDecimals,
  fetchTokenTotalSupply,
} from "./utils";

export function handlePairCreated(event: PairCreated): void {
  let factory = Factory.load(FACTORY_ADDRESS);

  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.totalPairs = ZERO_BI;
    factory.totalTokens = ZERO_BI;
    factory.totalTransactions = ZERO_BI;

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
    token0.totalLiquidity = ZERO_BD;
    token0.totalTransactions = ZERO_BI;
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
    token1.totalLiquidity = ZERO_BD;
    token1.totalTransactions = ZERO_BI;
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
  pair.totalSupply = ZERO_BD;
  pair.token0Price = ZERO_BD;
  pair.token1Price = ZERO_BD;
  pair.volumeToken0 = ZERO_BD;
  pair.volumeToken1 = ZERO_BD;
  pair.totalTransactions = ZERO_BI;
  pair.liquidityProviderCount = ZERO_BI;
  pair.save();

  // Factory
  factory.totalPairs = factory.totalPairs.plus(ONE_BI);

  // Entities
  factory.save();

  PairTemplate.create(event.params.pair);
}
