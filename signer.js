
// import TransactionBuilder from 'chain/src/TransactionBuilder';
// import PrivateKey from "ecc/src/PrivateKey";
// import transaction  from "serializer/src/operations";
// import SignedTransaction from "serializer/src/operations"

const request = require('request');
// const { Apis } = require("cybexjs-ws");

// const Transaction = require('./serializer/src/operations').transaction;
// const SignedTransaction = require('./serializer/src/operations').signed_transaction;
const PrivateKey = require('./ecc/src/PrivateKey');
const TransactionBuilder = require('./serializer/TransactionBuilder');

function toEpochUTCSec(dateTimeStr) {
    var epoch = new Date(dateTimeStr);
    return epoch.getTime() / 1000 - (epoch.getTimezoneOffset() * 60);
}

function limit_order_create(account, wifKey) {
    var exp = Math.floor(Date.now() / 1000) + 1000;
    var tr = new TransactionBuilder();

    tr.add_type_operation("limit_order_create", {
        fee: {
            amount: 55,
            asset_id: "1.3.0"
        },
        seller: account,
        amount_to_sell: {amount: 100, asset_id: "1.3.27"},
        min_to_receive: {amount: 100000, asset_id: "1.3.0"},
        expiration: exp,
        fill_or_kill: false
    });
    tr.expiration = exp;

    const params = block_params("0075e165e7dd280f5562e83d1e05c141321b4033");

    tr.ref_block_num = params.ref_block_num;
    tr.ref_block_prefix = params.ref_block_prefix;

    tr.chain_id = "90be01e82b981c8f201c9a78a3d31f655743b29ff3274727b1439b093d04aa23";

    signedTx = sign(tr, wifKey)
    console.log(signedTx);

    return signedTx;
}

function limit_order_cancel(account, order_id) {
    var exp = Math.floor(Date.now() / 1000) + 1000;
    var tr = new TransactionBuilder();

    tr.add_type_operation("limit_order_cancel", {
        fee: {
            amount: 5,
            asset_id: "1.3.0"
        },
        "order": order_id,
        fee_paying_account: account,
        expiration: exp
    });
    tr.expiration = exp;

    tr.update_head_block()
    tr.set_expire_seconds(30)

    tr.ref_block_num = 33765;
    tr.ref_block_prefix = 2974748438;
    tr.chain_id = "90be01e82b981c8f201c9a78a3d31f655743b29ff3274727b1439b093d04aa23";

    signedTx = sign(tr, wifKey)
    console.log(JSON.stringify(signedTx));
}

function exexuteTranscation(body) {
    var txId = body.transactionId;
    console.log(txId);
    var options = {
        uri: 'https://api.cybex.io/v1/transaction',
        method: 'POST',
        json: body
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body.Status === "Successful") {
                //openOrder++;
                console.log("success ======================", body);
                //console.log(response);
                //setTimeout(createCancelOrderByTxIdPayload, 2000, txId, handleCancelOrderPayload);
                return {txid:txId, body:body}
            }
        }else{
            console.log("error ====================== ",response.statusCode);
        }
    });
}
// ref_block_num = int(ref_block_id[:8], 16) & 0xFFFF
// ref_block_prefix = struct.unpack_from("<I", unhexlify(ref_block_id), 4)[0]

function block_params(ref_block_id){
    const ref_block_num = parseInt(ref_block_id.substring(0 ,8),16) & 0xffff;
    const ref_block_prefix = new Buffer.from(ref_block_id, "hex").readUInt32LE(4);

    return {ref_block_num: ref_block_num, ref_block_prefix:ref_block_prefix}
}

// createNewOrderPayload(true, 10, 0.01, 'ETH/USDT', exexuteTranscation);

async function test_sign(account, wifKey) {
    // let instanceRes = await Apis.instance("wss://hongkong.cybex.io", true).init_promise;
    const params = block_params("00b58424c5d6ea1b7db7b0bc98221b54b5084937");
    const pKey = PrivateKey.fromWif(wifKey);
    // var exp = Math.floor(Date.now() / 1000) + 9000;
    const exp = 1555545599;
    var tr = new TransactionBuilder();

    tr.ref_block_num = params.ref_block_num;
    tr.ref_block_prefix = params.ref_block_prefix;

    const buy_sell = {
        sell:{ asset_id: '1.3.27', amount: 100000 },
        receive:{ asset_id: '1.3.2', amount: 10000 }
    };

    tr.add_type_operation("limit_order_create", {
        fee: {amount: 55, asset_id: "1.3.0"},
        seller:account,
        amount_to_sell: buy_sell.sell,
        min_to_receive: buy_sell.receive,
        expiration: exp,
        fill_or_kill: false
    });
    tr.expiration = exp;

    const chain_id = "90be01e82b981c8f201c9a78a3d31f655743b29ff3274727b1439b093d04aa23"
    tr.sign_with_key(chain_id, pKey);

    // hexlify(hashlib.sha256(bytes(self)).digest()[:20]).decode("ascii")
    // const _txid = hash.sha256(tr.tr_buffer).toString('hex').substring(0, 40);

    if (tr.signatures){

        // const _signedTx = SignedTransaction.toObject(tr);

        const signedTx = {
            transactionType: "NewLimitOrder",
            transactionId: tr.id(),
            refBlockNum:params.ref_block_num,
            refBlockPrefix:params.ref_block_prefix,
            txExpiration:exp,
            fee: { assetId: '1.3.0', amount: 55 },
            seller: account,
            amountToSell: {"assetId":buy_sell.sell.asset_id,amount:buy_sell.sell.amount},
            minToReceive: {"assetId":buy_sell.receive.asset_id,amount:buy_sell.receive.amount},
            expiration: exp,
            signature:_signedTx.signatures[0],
            fill_or_kill:0,
            isBuy: 0
        };
        console.log(signedTx);

        const res = await exexuteTranscation(signedTx)
        console.log(res);
    }
}

async function test_cancel(account, wifKey, trxid) {
    // let instanceRes = await Apis.instance("wss://hongkong.cybex.io", true).init_promise;
    const params = block_params("00b58424c5d6ea1b7db7b0bc98221b54b5084937");
    const pKey = PrivateKey.fromWif(wifKey);
    // var exp = Math.floor(Date.now() / 1000) + 9000;
    // const exp = 1555545599;
    var tr = new TransactionBuilder();

    tr.ref_block_num = params.ref_block_num;
    tr.ref_block_prefix = params.ref_block_prefix;

    tr.add_type_operation("limit_order_cancel", {
        fee: {amount: 5, asset_id: "1.3.0"},
        fee_paying_account:account,
        order: "1.7.0",
        extensions: [
            [6, {trx_id: trxid}]
        ]
    });

    const chain_id = "90be01e82b981c8f201c9a78a3d31f655743b29ff3274727b1439b093d04aa23"
    tr.sign_with_key(chain_id, pKey);

    // hexlify(hashlib.sha256(bytes(self)).digest()[:20]).decode("ascii")
    // const _txid = hash.sha256(tr.tr_buffer).toString('hex').substring(0, 40);

    if (tr.signatures){

        // const _signedTx = SignedTransaction.toObject(tr);

        const signedTx = {
            transactionType:"Cancel",
            transactionId: tr.id(),
            originalTransactionId: trxid,
            refBlockNum:params.ref_block_num,
            refBlockPrefix:params.ref_block_prefix,
            txExpiration:exp,
            orderId: '0',
            fee: { assetId: '1.3.0', amount: 5 },
            seller: account,
            signature:_signedTx.signatures[0],
        };
        console.log(signedTx);

        const res = await exexuteTranscation(signedTx)
        console.log(res);
    }
}

async function test_cancel_all(account, wifKey, pair) {
    // let instanceRes = await Apis.instance("wss://hongkong.cybex.io", true).init_promise;
    const params = block_params("00b58424c5d6ea1b7db7b0bc98221b54b5084937");
    const pKey = PrivateKey.fromWif(wifKey);
    // var exp = Math.floor(Date.now() / 1000) + 9000;
    // const exp = 1555545599;
    var tr = new TransactionBuilder();

    tr.ref_block_num = params.ref_block_num;
    tr.ref_block_prefix = params.ref_block_prefix;

    tr.add_type_operation("cancel_all", {
        fee: {amount: 50, asset_id: "1.3.0"},
        seller:account,
        sell_asset_id: pair.quote['id'],
        receive_asset_id: pair.base['id']
    });

    const chain_id = "90be01e82b981c8f201c9a78a3d31f655743b29ff3274727b1439b093d04aa23"
    tr.sign_with_key(chain_id, pKey);

    // hexlify(hashlib.sha256(bytes(self)).digest()[:20]).decode("ascii")
    // const _txid = hash.sha256(tr.tr_buffer).toString('hex').substring(0, 40);

    if (tr.signatures){

        // const _signedTx = SignedTransaction.toObject(tr);

        const signedTx = {
            transactionType:"CancelAll",
            transactionId: tr.id(),
            refBlockNum:params.ref_block_num,
            refBlockPrefix:params.ref_block_prefix,
            txExpiration:exp,
            fee: { assetId: '1.3.0', amount: 50 },
            seller: account,
            sellAssetId: pair.quote['id'],
            recvAssetId: pair.base['id'],
            signature:_signedTx.signatures[0],
        };
        console.log(signedTx);

        const res = await exexuteTranscation(signedTx)
        console.log(res);
        return res;
    }
}

// var offSet = new Date().getTimezoneOffset();
// console.log(offSet);
// test_cancel("1.2.46197", "5KADTmswGdzfwQrmYwTG1mLUGsvRP1TzUkXfgJoJ1keqJw6SF6z", "e2cd426aa27e9094c2c7567a982bc461665993f3");

const res = test_cancel_all("1.2.46197","5KADTmswGdzfwQrmYwTG1mLUGsvRP1TzUkXfgJoJ1keqJw6SF6z",{"base":{"id":"1.3.0"},"quote":{"id":"1.3.0"}})







