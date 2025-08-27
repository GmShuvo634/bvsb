// src/config.ts

export interface ServerUrlConfig {
  https: string;
  wss:   string;
  uniswap: string;
  avatars: string;
}

export interface SocketTypeConfig {
  btcPrice:     string;
  players:      string;
  sendMessage:  string;
  basicMessages:string;
  bet:          string;
  updateMessage:string;
}

export interface WalletAddressConfig {
  treasury: string;
  dev:      string;
  owner:    string;
}

export interface ConfigType {
  serverUrl:     ServerUrlConfig;
  socketType:    SocketTypeConfig;
  roundTime:     { basic: number; prepare: number; play: number; refresh: number };
  interval:      { priceUpdate: number };
  graphVerticalRatio: number;
  graphHorizontalZoomRatio: number;
  zoomTime:      number;
  fee:           number;
  uniswapPath:   string;
  betPrices:     number[];
  btcPriceDecimal: number;
  gameCoinDecimal: number;
  walletAddress: WalletAddressConfig;
  encryptKey:    { normal: string; };
}

export const Config: ConfigType = {
  serverUrl: {
    https:   process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5001',
    wss:     process.env.NEXT_PUBLIC_WSS_URL  || 'ws://localhost:5001/ws',
    uniswap: process.env.NEXT_PUBLIC_UNI_URL  || 'https://app.uniswap.org',
    avatars: process.env.NEXT_PUBLIC_AVATARS_URL || 'http://localhost:5001/',
  },
  socketType: {
    btcPrice:      'btcPrice',
    players:       'players',
    sendMessage:   'sendMessage',
    basicMessages: 'basicMessages',
    updateMessage: 'updateMessage',
    bet:           'bet',
  },
  roundTime: {
    basic:   30000,  // 30 seconds - betting phase
    prepare: 10000,  // 10 seconds - transition to play
    play:    60000,  // 60 seconds - price monitoring phase
    refresh: 20000,  // 20 seconds - results display
  },
  interval: {
    priceUpdate: 300,
  },
  graphVerticalRatio:       100,
  graphHorizontalZoomRatio: 2,
  zoomTime:      2000,
  fee:           0.05,
  uniswapPath:   '/#/swap?outputCurrency=ETH',
  betPrices:     [5,10,15,20,30,50,100],
  btcPriceDecimal:    10000,
  gameCoinDecimal:    1000,
  walletAddress: {
    treasury: '0xdcfa6407a4dEd8Dd4Cd84A83f23ACc4A7B5b1de2',
    dev:      '0xdcfa6407a4dEd8Dd4Cd84A83f23ACc4A7B5b1de2',
    owner:    '0xdcfa6407a4dEd8Dd4Cd84A83f23ACc4A7B5b1de2',
  },
  encryptKey: {
    normal: process.env.NEXT_PUBLIC_ENCRYPT_KEY || '',
  },
};

