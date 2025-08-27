export const Config = {
  serverUrl: {
    https: "http://localhost:5001",
    uniswap: "http://localhost:4002",
    wss: "ws://localhost:5001/ws", // Fixed: Use same port as backend with /ws path
    avatars: "http://localhost:5001/"
    // https: "http://localhost:4000",
    // wss: "ws://localhost:4001",
    // avatars: "http://localhost:4000/avatars/"
  },
  audioUrl: {
    ambience: "https://upvsdown.com/media/audio/ambience.mp3"
  },
  btcPriceDecimal: 1000000,
  ethPriceDecimal: 1000000,
  btcPriceCountLimit: 50,
  btcPriceCountReset: 20,
  socketType: {
    btcPrice: 4272,
    bet: 777,
    players: 4834,
    sendMessage: 3743,
    updateMessage: 6434,
    basicMessages: 6172,
  },
  graphVerticalRatio: 120,
  graphHorizontalZoomRatio: 2,
  zoomTime: 1000,
  interval: {
    priceUpdate: 500,
  },
  roundTime: {
    basic: 50000,
    prepare: 30000,
    play: 10000,
    refresh: 5000,
  },
  walletAddress: {
    treasury: "0x7840F01d71ee2F46b96B71232570BED03f644Ab7",
    dev: "0x7924281caeB06a92c79d27F14CBbD9C68e660fe4",
    owner: "0x7924281caeB06a92c79d27F14CBbD9C68e660fe4"
  },
  gameCoinDecimal: 1000,
  encryptKey: {
    normal: "MV9b23bQeMQ7isAGTkoBZGErH853yGk0",
  },
  betPrices: [1, 2.5, 5, 10, 15, 25, 50],
  fee: 0.03,
  weeklyPool: [9, 7, 5, 2, 1],
};
