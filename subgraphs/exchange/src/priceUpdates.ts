import { BigDecimal, Address, Bytes } from "@graphprotocol/graph-ts/index";
import { KlayOracle } from "../generated/templates/DexPair/KlayOracle";
import { Pair, Token, Bundle } from "../generated/schema";
import { log } from '@graphprotocol/graph-ts';
import { ONE_BD, ZERO_BD, getFactoryContract, ADDRESS_ZERO, USDT_PRECISION } from "./utils";
import { WKLAY_ADDRESS, KlayOracleAddress, whitelistedAddresses } from "./utils/config";

/**
 * @todo update to be derived WKLAY (add stablecoin estimates) (optional)
*/
export function getKlayPriceInUSD(): BigDecimal {
    let contract = KlayOracle.bind(Address.fromString(KlayOracleAddress));
    let priceResult = contract.try_valueFor(Bytes.fromHexString("0x5d9add3300000000000000000000000000000000000000000000000000000000"))
    if (!priceResult.reverted) {
        return priceResult.value.value0.divDecimal(USDT_PRECISION);
    }
    return ZERO_BD;
}

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_KLAY = BigDecimal.fromString('1')

/**
 * Search through graph to find derived WKLAY per token.
 **/
 export function findKlayPerToken(token: Token, factoryAddress: string): BigDecimal {
    let res = token.id == WKLAY_ADDRESS.toLowerCase();
    log.info('ID Match {}:', [res.toString()]); 
    if (token.id == WKLAY_ADDRESS.toLowerCase()) { 
      return ONE_BD;
    }
    let factoryContract = getFactoryContract(factoryAddress);
    // loop through whitelistedAddresses and check if paired with any
    for (let i = 0; i < whitelistedAddresses.length; ++i) {
      let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(whitelistedAddresses[i]));
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
    if (whitelistedAddresses.includes(token0.id) && whitelistedAddresses.includes(token1.id)) {
      return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString("2"));
    }
  
    // take full value of the whitelisted token amount
    if (whitelistedAddresses.includes(token0.id) && !whitelistedAddresses.includes(token1.id)) {
      return tokenAmount0.times(price0);
    }
  
    // take full value of the whitelisted token amount
    if (!whitelistedAddresses.includes(token0.id) && whitelistedAddresses.includes(token1.id)) {
      return tokenAmount1.times(price1);
    }
  
    // neither token is on white list, tracked volume is 0
    return ZERO_BD;
  }

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
 export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load(KlayOracleAddress)!;
  let price0 = token0.derivedKLAY.times(bundle.klayPrice);
  let price1 = token1.derivedKLAY.times(bundle.klayPrice);

  // both are whitelist tokens, take average of both amounts
  if (whitelistedAddresses.includes(token0.id) && whitelistedAddresses.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1));
  }

  // take double value of the whitelisted token amount
  if (whitelistedAddresses.includes(token0.id) && !whitelistedAddresses.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'));
  }

  // take double value of the whitelisted token amount
  if (!whitelistedAddresses.includes(token0.id) && whitelistedAddresses.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'));
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD;
}
