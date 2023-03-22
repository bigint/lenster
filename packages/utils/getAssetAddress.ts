import { MAINNET_DEFAULT_TOKEN } from 'data/contracts';

interface AssetMap {
  [key: string]: string;
}

const assetMap: AssetMap = {
  WMATIC: MAINNET_DEFAULT_TOKEN,
  WETH: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  NCT: '0xD838290e877E0188a4A44700463419ED96c16107'
};

/**
 * Get the address of the token based on its symbol.
 *
 * @param symbol - The symbol of the token
 * @returns The address of the token
 */
const getAssetAddress = (symbol: string): string => {
  return assetMap[symbol] ?? MAINNET_DEFAULT_TOKEN;
};

export default getAssetAddress;
