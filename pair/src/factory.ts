/* eslint-disable prefer-const */
import { Factory, Pair, Token } from "../generated/schema";
import { Pair as PairTemplate } from "../generated/templates";
import { PairCreated } from "../generated/Factory/Factory";
import {
  FACTORY_ADDRESS,
  ZERO_BD,
  ZERO_BI,
  ONE_BI,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenDecimals,
} from "./utils";

export function handlePairCreated(event: PairCreated): void {
  let factory = Factory.load(FACTORY_ADDRESS);

  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.totalPairs = ZERO_BI;
    factory.totalTokens = ZERO_BI;
  }
  factory.totalPairs = factory.totalPairs.plus(ONE_BI);
  factory.save();

  let token0 = Token.load(event.params.token0.toHex());

  if (token0 === null) {
    token0 = new Token(event.params.token0.toHex());
    token0.name = fetchTokenName(event.params.token0);
    token0.symbol = fetchTokenSymbol(event.params.token0);
    let decimals = fetchTokenDecimals(event.params.token0);
    if (decimals === null) {
      return;
    }
    token0.decimals = decimals;
    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  let token1 = Token.load(event.params.token1.toHex());

  if (token1 === null) {
    token1 = new Token(event.params.token1.toHex());
    token1.name = fetchTokenName(event.params.token1);
    token1.symbol = fetchTokenSymbol(event.params.token1);
    let decimals = fetchTokenDecimals(event.params.token1);
    if (decimals === null) {
      return;
    }
    token1.decimals = decimals;

    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  // Pair
  let pair = new Pair(event.params.pair.toHex()) as Pair;
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  // pair.name = token0.symbol.concat("-").concat(token1.symbol);
  pair.hash = event.transaction.hash;
  pair.block = event.block.number;
  pair.timestamp = event.block.timestamp;

  // Factory
  factory.totalPairs = factory.totalPairs.plus(ONE_BI);

  // Entities
  token0.save();
  token1.save();
  pair.save();
  factory.save();

  // PairTemplate.create(event.params.pair);
}
