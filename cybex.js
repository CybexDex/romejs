var {TransactionBuilder, ops, Signature, PrivateKey} = require("bitsharesjs")

function toEpochUTCSec(dateTimeStr) {
    const epoch = new Date(dateTimeStr);
    return epoch.getTime() / 1000 - (epoch.getTimezoneOffset() * 60);
}

class CybexSigner{

    constructor(account, key) {
        this.user = {id: account};
        this.wifKey = key;
        this.pKey = PrivateKey.fromWif(this.wifKey);
    }

    async op_sign(type_name, obj){

        let tr = new TransactionBuilder()
        tr.add_type_operation(type_name, obj)
        tr.expiration = obj.expiration
        tr.tr_buffer = Transaction.toBuffer(tr);
        tr.add_signer(this.pKey, this.pKey.toPublicKey().toPublicKeyString())

        tr.sign();

        let signedTx = ops.signed_transaction.toObject(tr);

        signedTx.expiration = toEpochUTCSec(signedTx.expiration);
        signedTx.operations.forEach(value => {
            value[1].expiration = toEpochUTCSec(value[1].expiration);
        });

        return signedTx

    }

    async assetAmount(assetid, amount) {
        let asset = (await this.queryAsset(assetid))
        return parseFloat((amount / Math.pow(10, asset.precision)).toFixed(asset.precision))
    }
    async assetAmountRaw(assetid, amount) {
        let asset = (await this.queryAsset(assetid))
        return parseInt(amount * Math.pow(10, asset.precision))
    }

    async limit_order_create(base_id, quote_id, side, price, amount, fee_asset_id = "1.3.0", total = null) {

        try {
            const exp = Math.floor(Date.now() / 1000) + 1000;
            let sell, buy
            let quote_amount = await this.assetAmountRaw(quote_id, amount)
            if (!total) {
                total = amount * price
            }
            let base_amount = await this.assetAmountRaw(base_id, total)
            let base = {
                asset_id: base_id,
                amount: base_amount
            }
            let quote = {
                asset_id: quote_id,
                amount: quote_amount
            }
            if (side === "buy") {
                sell = base
                buy = quote
            } else {
                sell = quote
                buy = base
            }
            let obj = {
                "seller": this.user.id,
                "amount_to_sell": sell,
                "min_to_receive": buy,
                "expiration": exp,
                "fill_or_kill": false,
                "fee": {
                    "amount": 55,
                    "asset_id": fee_asset_id
                },
            };

            let r = await this.op_sign("limit_order_create", obj, fee_asset_id)
            return r
        } catch (e) {
            if (e.message.includes("Cannot read property 'precision' of null")) {
                throw new Error(err_pre + "S.config.trade")
            }
            if (e.message.includes("insufficient balance")) {
                throw new Error(err_pre + "UB.balance.trade")
            }
            if (e.message.includes("Insufficient Balance")) {
                throw new Error(err_pre + "UB.fee.trade")
            }
            if (e.message.includes("authority")) {
                throw new Error(err_pre + "UB.authority.trade")
            }
            console.error(e)
            throw new Error(err_pre + "S.node.trade")
        }
    }

    async cancel_order(order_id, fee_asset_id = "1.3.0",) {
        try {
            let obj = {
                "fee_paying_account": this.user.id,
                "order": order_id,
                "fee": {
                    "amount": 5,
                    "asset_id": fee_asset_id
                },
            }
            let r = await this.op_sign("limit_order_cancel", obj)
            return r
        } catch (e) {
            if (e.message.includes("Unable to find Object")) {
                throw new Error(err_pre + "UB.noid.cancel_order")
            }
            if (e.message.includes("Insufficient Balance")) {
                throw new Error(err_pre + "UB.fee.cancel_order")
            }
            console.error(e)
            throw new Error(err_pre + "S.node.cancel_order")
        }
    }

    async cancel_all(assetPair, fee_asset_id = "1.3.0",) {
        try {
            let obj = {
                "seller": this.user.id,
                "assetPair": assetPair,
                "fee": {
                    "amount": 5,
                    "asset_id": fee_asset_id
                },
            }
            let r = await this.op_sign("cancel_all", obj)
            return r
        } catch (e) {
            if (e.message.includes("Unable to find Object")) {
                throw new Error(err_pre + "UB.noid.cancel_order")
            }
            if (e.message.includes("Insufficient Balance")) {
                throw new Error(err_pre + "UB.fee.cancel_order")
            }
            console.error(e)
            throw new Error(err_pre + "S.node.cancel_order")
        }
    }
}

module.exports = class Cybex {

    constructor(account, key) {
        this.user = {id: account};
        this.wifKey = key;
        this.pKey = PrivateKey.fromWif(this.wifKey);

        this.headers = {}

        if(account&&key){
            this.singer = CybexSigner(account,key)
        }
    }

    fetch (url, method = 'GET', headers = undefined, body = undefined) {

        if (isNode && this.userAgent) {
            if (typeof this.userAgent === 'string')
                headers = extend ({ 'User-Agent': this.userAgent }, headers)
            else if ((typeof this.userAgent === 'object') && ('User-Agent' in this.userAgent))
                headers = extend (this.userAgent, headers)
        }

        if (typeof this.proxy === 'function') {

            url = this.proxy (url)
            if (isNode)
                headers = extend ({ 'Origin': this.origin }, headers)

        } else if (typeof this.proxy === 'string') {

            if (this.proxy.length)
                if (isNode)
                    headers = extend ({ 'Origin': this.origin }, headers)

            url = this.proxy + url
        }

        headers = extend (this.headers, headers)

        if (this.verbose)
            console.log ("fetch:\n", this.id, method, url, "\nRequest:\n", headers, "\n", body, "\n")

        return this.executeRestRequest (url, method, headers, body)
    }

    async fetch2 (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {

        if (this.enableRateLimit)
            await this.throttle ()

        let request = this.sign (path, type, method, params, headers, body)
        return this.fetch (request.url, request.method, request.headers, request.body)
    }

    request (path, type = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        return this.fetch2 (path, type, method, params, headers, body)
    }

    parseJson (jsonString) {
        return JSON.parse (jsonString)
    }





}
