import { BigDecimal, Address, Bytes } from "@graphprotocol/graph-ts/index";
import { KlayOracle } from "../generated/templates/Pair/KlayOracle";
import { Pair, Token, Bundle } from "../generated/schema";
import { log } from '@graphprotocol/graph-ts';
import { ONE_BD, ZERO_BD, KlayOracleAddress, factoryContract, ADDRESS_ZERO, USDT_PRECISION } from "./utils";

const WKLAY_ADDRESS = "0xae3a8a1d877a446b22249d8676afeb16f056b44e"

export function getKlayPriceInUSD(): BigDecimal {
    let contract = KlayOracle.bind(Address.fromString(KlayOracleAddress));
    let priceResult = contract.try_valueFor(Bytes.fromHexString("0x5d9add3300000000000000000000000000000000000000000000000000000000"))
    if (!priceResult.reverted) {
        return priceResult.value.value0.divDecimal(USDT_PRECISION);
    }
    return ZERO_BD;
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
    "0xae3a8a1d877a446b22249d8676afeb16f056b44e", // WKLAY
]

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_KLAY = BigDecimal.fromString('1')

/**
 * Search through graph to find derived BNB per token.
 * @todo update to be derived BNB (add stablecoin estimates)
 **/
 export function findKlayPerToken(token: Token): BigDecimal {
    let res = token.id == WKLAY_ADDRESS;
    log.info('ID Match {}:', [res.toString()]); 
    if (token.id == WKLAY_ADDRESS) { 
      return ONE_BD;
    }
    // loop through whitelist and check if paired with any
    for (let i = 0; i < WHITELIST.length; ++i) {
      let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]));
      if (pairAddress.toHex() != ADDRESS_ZERO) {
        let pair = Pair.load(pairAddress.toHex())!;
        if (pair.token0 == token.id && pair.reserveKLAY.gt(MINIMUM_LIQUIDITY_THRESHOLD_KLAY)) {
          let token1 = Token.load(pair.token1)!;
          return pair.token1Price.times(token1.derivedKLAY as BigDecimal); // return token1 per our token * KLAY per token 1
        }
        if (pair.token1 == token.id && pair.reserveKLAY.gt(MINIMUM_LIQUIDITY_THRESHOLD_KLAY)) {
          let token0 = Token.load(pair.token0)!;
          return pair.token0Price.times(token0.derivedKLAY as BigDecimal); // return token0 per our token * KLAY per token 0
        }
      }
    }
    return ZERO_BD; // nothing was found return 0
  }
  
  /**
   * Accepts tokens and amounts, return tracked amount based on token whitelist
   * If one token on whitelist, return amount in that token converted to USD.
   * If both are, return average of two amounts
   * If neither is, return 0
   */
  export function getTrackedVolumeUSD(
    bundle: Bundle,
    tokenAmount0: BigDecimal,
    token0: Token,
    tokenAmount1: BigDecimal,
    token1: Token
  ): BigDecimal {
    let price0 = token0.derivedKLAY.times(bundle.klayPrice);
    let price1 = token1.derivedKLAY.times(bundle.klayPrice);
  
    // both are whitelist tokens, take average of both amounts
    if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString("2"));
    }
  
    // take full value of the whitelisted token amount
    if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
      return tokenAmount0.times(price0);
    }
  
    // take full value of the whitelisted token amount
    if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
      return tokenAmount1.times(price1);
    }
  
    // neither token is on white list, tracked volume is 0
    return ZERO_BD;
  }