#romejs

Romejs is a javascript binding for the Cybex ROME API. 

Romejs is released with built-in signer, no need to run separate signing program. Here is the basic usage example.

````javascript

(async () => {
    const cybex = new Cybex();
    const assetPair = "ETH/USDT";
    
    const orderbook = await cybex.fetchOrderBook(assetPair, 1);
    console.log(orderbook);
    
    const olhcv = await cybex.fetchOHLCV(assetPair);
    console.log(olhcv);
    
    const balance = await cybex.fetchBalance("shanti001");
    console.log(balance);
    
    const pubTrades = await cybex.fetchTrades(assetPair, true, 5);
    console.log(pubTrades);
    
 
    const r = await cybex.setSigner({accountName:"accountName", "password":"password"});
    // const r = await cybex.setSigner({account:"1.2.xxxxx", "key":"private_key"});
    const res= cybex.createMarketBuyOrder(assetPair, 0.01);
    console.log(res);
    
})();

````


## supported methods

All methods are async.

**fetchMarkets ():** 
Fetches a list of all available markets from an exchange and returns an array of markets (objects with properties such as assetPair, base, quote etc.). Some exchanges do not have means for obtaining a list of markets via their online API. For those, the list of markets is hardcoded.

**loadMarkets ([reload]):**
Returns the list of markets as an object indexed by assetPair and caches it with the exchange instance. Returns cached markets if loaded already, unless the reload = true flag is forced.

**fetchOrderBook (assetPair[, limit = undefined[, params = {}]]):** 
Fetch L2/L3 order book for a particular market trading assetPair.

**fetchTrades (assetPair[, since[, [limit, [params]]]]):**
Fetch recent trades for a particular trading assetPair.

**fetchBalance (accountName)** 
Fetch Balance.

**createOrder(assetPair, side, amount, price)**

**createLimitBuyOrder (assetPair, amount, price[, params])**

**createLimitSellOrder (assetPair, amount, price[, params])**

**createMarketBuyOrder (assetPair, amount[, params])**

**createMarketSellOrder (assetPair, amount[, params])**

**cancelOrder (transactionId[, params])**

**fetchOrder (transactionId[, accountName[, params]])**

**fetchOrders ([assetPair[, accountName[, limit[, params]]]])**

**fetchOpenOrders ([assetPair[, accountName, limit, params]]]])**

**fetchClosedOrders ([assetPair[, accountName[, limit[, params]]]])**

**fetchMyTrades ([assetPair[, accountName[, limit[, params]]]])**

**fetchOHLCV (assetPair, interval = '1m')**

