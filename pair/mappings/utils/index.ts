/* eslint-disable prefer-const */
import { BigInt, BigDecimal, Address, log } from "@graphprotocol/graph-ts";
import { KIP7 } from "../../generated/Factory/KIP7";
import { KIP7NameBytes } from "../../generated/Factory/KIP7NameBytes";
import { KIP7SymbolBytes } from "../../generated/Factory/KIP7SymbolBytes";
import { Factory as FactoryContract } from "../../generated/templates/Pair/Factory";

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export let FACTORY_ADDRESS = "0xEB487a3A623E25cAa668B6D199F1aBa9D2380456";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");
export let BI_18 = BigInt.fromI32(18);

export let factoryContract = FactoryContract.bind(Address.fromString(FACTORY_ADDRESS));

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
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
  let decimalValue = null;
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue as i32);
}
