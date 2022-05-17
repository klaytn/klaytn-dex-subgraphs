import { BigDecimal, Address, Bytes, BigInt } from "@graphprotocol/graph-ts/index";
import { KlayOracle } from "../generated/Factory/KlayOracle";
import { ZERO_BD, KlayOracleAddress, USDT_PRECISION } from "./utils";



export function getKlayPriceInUSD(): BigDecimal {
    let contract = KlayOracle.bind(Address.fromString(KlayOracleAddress));
    let priceResult = contract.try_valueFor(Bytes.fromHexString("0x5d9add3300000000000000000000000000000000000000000000000000000000"))
    if (!priceResult.reverted) {
        return priceResult.value.value0.divDecimal(USDT_PRECISION);
    }
    return ZERO_BD;

}