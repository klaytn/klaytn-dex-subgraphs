/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address, log, ethereum, Bytes } from "@graphprotocol/graph-ts";
import { KIP7 } from "../../generated/DexFactory/KIP7";
import { KIP7NameBytes } from "../../generated/DexFactory/KIP7NameBytes";
import { KIP7SymbolBytes } from "../../generated/DexFactory/KIP7SymbolBytes";
import { User, Bundle, LiquidityPosition, LiquidityPositionSnapshot, Pair, Token } from '../../generated/schema';
import { DexFactory as FactoryContract } from "../../generated/templates/DexPair/DexFactory";
import { KlayOracleAddress } from "./config";

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");
export let USDT_PRECISION = BigDecimal.fromString("1000000");
export let BI_18 = BigInt.fromI32(18);

export function getFactoryContract(factoryAddress: string): FactoryContract {
  return FactoryContract.bind(Address.fromString(factoryAddress));
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(BigInt.fromI32(18)))
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(ZERO_BD.toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullKlayValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = KIP7.bind(tokenAddress);
  let contractSymbolBytes = KIP7SymbolBytes.bind(tokenAddress);

  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();

  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      symbolValue = symbolResultBytes.value.toString();
    }
  } else {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = KIP7.bind(tokenAddress);
  let contractNameBytes = KIP7NameBytes.bind(tokenAddress);

  let nameValue = "unknown";
  let nameResult = contract.try_name();

  log.info("{}", [nameResult.value]);

  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      nameValue = nameResultBytes.value.toString();
    }
  } else {
    nameValue = nameResult.value;
  }
  return nameValue;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = KIP7.bind(tokenAddress);
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    return BigInt.fromI32(decimalResult.value as i32);
  }
  return ZERO_BI;
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
  let contract = KIP7.bind(tokenAddress);

  let totalSupplyResult = contract.try_totalSupply();
  if (!totalSupplyResult.reverted) {
    return totalSupplyResult.value;
  }
  return ZERO_BI;
}

export function createLiquidityPosition(exchange: Address, user: Bytes): LiquidityPosition {
  let id = exchange
    .toHexString()
    .concat('-')
    .concat(user.toHexString())
  let liquidityTokenBalance = LiquidityPosition.load(id)
  if (liquidityTokenBalance === null) {
    let pair = Pair.load(exchange.toHexString())!
    pair.liquidityProviderCount = pair.liquidityProviderCount.plus(ONE_BI)
    liquidityTokenBalance = new LiquidityPosition(id)
    liquidityTokenBalance.liquidityTokenBalance = ZERO_BD
    liquidityTokenBalance.pair = exchange.toHexString()
    liquidityTokenBalance.user = user.toHexString()
    liquidityTokenBalance.save()
    pair.save()
  }
  if (liquidityTokenBalance === null) log.error('LiquidityTokenBalance is null', [id])
  return liquidityTokenBalance as LiquidityPosition
}

export function createUser(address: Address): void {
  let user = User.load(address.toHexString())
  if (user === null) {
    user = new User(address.toHexString())
    user.save()
  }
}

export function createLiquiditySnapshot(position: LiquidityPosition, event: ethereum.Event): void {
  let timestamp = event.block.timestamp.toI32();
  let bundle = Bundle.load(KlayOracleAddress)!;
  let pair = Pair.load(position.pair)!;
  let token0 = Token.load(pair.token0)!;
  let token1 = Token.load(pair.token1)!;

  // create new snapshot
  let snapshot = new LiquidityPositionSnapshot(position.id.concat(timestamp.toString()));
  snapshot.liquidityPosition = position.id;
  snapshot.timestamp = timestamp;
  snapshot.block = event.block.number.toI32();
  snapshot.user = position.user;
  snapshot.pair = position.pair;
  snapshot.token0PriceUSD = token0.derivedKLAY.times(bundle.klayPrice);
  snapshot.token1PriceUSD = token1.derivedKLAY.times(bundle.klayPrice);
  snapshot.reserve0 = pair.reserve0;
  snapshot.reserve1 = pair.reserve1;
  snapshot.reserveUSD = pair.reserveUSD;
  snapshot.liquidityTokenTotalSupply = pair.totalSupply;
  snapshot.liquidityTokenBalance = position.liquidityTokenBalance;
  snapshot.liquidityPosition = position.id;
  snapshot.save();
  position.save();
}
