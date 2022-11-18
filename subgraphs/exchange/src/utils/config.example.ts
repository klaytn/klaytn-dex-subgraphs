// Example of a config.ts file
export const WKLAY_ADDRESS = "0x6d1c5403bab8ff5fca04dab0a5d820ae0fa615e9";
export const KlayOracleAddress = "0xeD074DA2A76FD2Ca90C1508930b4FB4420e413B0";
// Please dont't forget to add your token address in lower case to the whitelist, otherwise it will not be tracked
// Also WKLAY_ADDRESS should be copied to the whitelist manually (also in lower case)
// Ready to copy example with WKLAY, USDT, USDC, WETH, WBTC, DAI tokens from Baobab network deployed by Klaytn team
export const whitelistedAddresses = ["0x6d1c5403bab8ff5fca04dab0a5d820ae0fa615e9", "0x63b3ace91d182013fed2ebaa0a8dd9aea243e865", 
"0xae33ac5c631b80757a0cf1395d1ce18f3eaa46c9", "0x53aa07e823e3ef9034fd8fb19cddd1b6323eaae3", 
"0xb61786e9d895ffc77f6b755b2ba479b706388bc1", "0x59d83777b3f1ebac785d2bae542b6e0846494855"];
// In the exchange subgraph we use KLAY-USDT oreacle to get KLAY price in USD
// So better not to create WKLAY-USDT, WKLAY-USDC, WKLAY-DAI pairs, it will lead to incorrect prices for these tokens
// between WKLAY based on pairs and oracle