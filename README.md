#romejs

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