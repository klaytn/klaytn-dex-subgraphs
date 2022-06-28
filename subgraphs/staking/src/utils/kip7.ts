/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Token } from "../../generated/schema";
import { KIP7 } from "../../generated/StakingFactory/KIP7";
import { KIP7NameBytes } from "../../generated/StakingFactory/KIP7NameBytes";
import { KIP7SymbolBytes } from "../../generated/StakingFactory/KIP7SymbolBytes";
import { ZERO_BI } from "./index"

export function isNullKlayValue(value: string): boolean {
  return value == "0x0000000000000000000000000000000000000000000000000000000000000001";
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = KIP7.bind(tokenAddress);
  let contractNameBytes = KIP7NameBytes.bind(tokenAddress);

  let nameValue = "unknown";
  let nameResult = contract.try_name();

  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      if (!isNullKlayValue(nameResultBytes.value.toHex())) {
        nameValue = nameResultBytes.value.toString();
      }
    }
  } else {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = KIP7.bind(tokenAddress);
  let contractSymbolBytes = KIP7SymbolBytes.bind(tokenAddress);

  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      if (!isNullKlayValue(symbolResultBytes.value.toHex())) {
        symbolValue = symbolResultBytes.value.toString();
      }
    }
  } else {
    symbolValue = symbolResult.value;
  }

  return symbolValue;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = KIP7.bind(tokenAddress);
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    return BigInt.fromI32(decimalResult.value as i32);
  }
  return ZERO_BI;
}

export function getOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHex());
  if (token === null) {
    token = new Token(address.toHex());
    token.name = fetchTokenName(address);
    token.symbol = fetchTokenSymbol(address);
    token.decimals = fetchTokenDecimals(address);
    token.save();
  }

  return token as Token;
}