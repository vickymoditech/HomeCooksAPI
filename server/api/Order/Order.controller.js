import Order from './Order.model';
import {errorJsonResponse, getGuid} from '../../config/commonHelper';
import UserDetail from '../UserDetail/UserDetail.model';
import FbPage from '../FbPages/fbPages.model';
import Keyword from '../keyword/keyword.model';
import {socketPublishMessage} from '../Socket';
import Log from '../../config/Log';
import config from '../../config/environment';
import axios from 'axios/index';

let CryptoJS = require('crypto-js');

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if(entity) {
            return res.status(statusCode)
                .json(entity);
        }
        return null;
    };
}

function handleEntityNotFound(res) {
    return function(entity) {
        if(!entity) {
            res.status(404)
                .end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode)
            .send(err);
    };
}

// Gets a single Order from the DB
export function show(req, res) {
    return Order.find({FbPageId: req.params.id})
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export async function order(req, res) {
    try {
        let FindOrder = await Order.findOne({_id: req.params.id});
        if(FindOrder) {
            let PageDetail = await FbPage.findOne({FbPageId: FindOrder.FbPageId});
            res.status(200)
                .json({
                    Order: FindOrder,
                    DeliveryTimeSlot: PageDetail.DeliveryDate
                });
        } else {
            res.status(400)
                .json(errorJsonResponse('your order has been removed', 'your order has been removed'));
        }
    } catch(error) {
        res.status(501)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function updateOrder(req, res, next) {
    try {
        const order = req.body.Order;
        const orderStatus = req.body.OrderStatus;
        const OrderId = order._id;
        let MessageResult = 'Your order has been updated';
        delete order._id;
        if(orderStatus !== '') {
            order.Status = orderStatus;
            MessageResult = 'Item has been updated';
        }
        let placeOrder = true;
        let ItemNotFound = [];
        let reduceQty = [];

        let PageDetail = await FbPage.findOne({FbPageId: order.FbPageId});
        const findOrder = await Order.findOne({_id: OrderId});
        order.Total = findOrder.Total;
        await Promise.all(order.Items.map(async(singleItem) => {
            const findProduct = await Keyword.findOne({_id: singleItem.id});
            const originalOrderQty = findOrder.Items.find((data) => data.id === singleItem.id);
            if(originalOrderQty.qty <= singleItem.qty) {
                if(!(findProduct.stock >= (singleItem.qty - originalOrderQty.qty))) {
                    placeOrder = false;
                    ItemNotFound.push(findProduct.description);
                }
            } else {
                reduceQty.push({
                    id: singleItem.id,
                    qty: originalOrderQty.qty - singleItem.qty
                });
            }
            return true;
        }));

        if(placeOrder) {
            let total = 0;
            await Promise.all(order.Items.map(async(singleItem) => {
                const originalOrderQty = findOrder.Items.find((data) => data.id === singleItem.id);
                let qty = 0;
                let updateQty = null;
                if(originalOrderQty.qty <= singleItem.qty) {
                    qty = singleItem.qty - originalOrderQty.qty;
                    updateQty = await Keyword.findOneAndUpdate(
                        {
                            _id: singleItem.id,
                            stock: {$gte: qty}
                        }, {
                            $inc: {stock: -qty}
                        }, {new: true});
                    total += (updateQty.price * qty);
                } else {
                    qty = originalOrderQty.qty - singleItem.qty;
                    updateQty = await Keyword.findOneAndUpdate(
                        {
                            _id: singleItem.id,
                        }, {
                            $inc: {stock: +qty}
                        }, {new: true});
                    total += (updateQty.price * -qty);
                }

                let result = await socketPublishMessage(order.FbPageId, {
                    type: 'keywordUpdate',
                    data: updateQty
                });

                result = await socketPublishMessage('AdminUser', {
                    type: 'keywordUpdate',
                    data: updateQty
                });
                return true;
            }));
            await UserDetail.findOneAndUpdate({
                FbSPID: order.FbSPID, ShippingMobile: null,
                ShippingAddress1: null,
                ShippingPostalCode: null
            }, {
                ShippingMobile: order.ShippingMobile,
                ShippingAddress1: order.ShippingAddress1,
                ShippingPostalCode: order.ShippingPostalCode,
                DeliveryTimeSlot: order.DeliveryTimeSlot,
            }, {new: true, setDefaultsOnInsert: true});
            order.Total += total;

            if(order.Total < PageDetail.Minimum) {
                order.ShippingCharge = PageDetail.ShippingMinimum;
            } else {
                order.ShippingCharge = 0;
            }

            let UpdateOrder = await Order.findOneAndUpdate({_id: OrderId}, order, {new: true, setDefaultsOnInsert: true});
            if(UpdateOrder) {
                let PageDetail = await FbPage.findOne({FbPageId: order.FbPageId});
                let result = await socketPublishMessage(UpdateOrder.FbPageId, {
                    type: 'order',
                    data: UpdateOrder
                });
                result = await socketPublishMessage('AdminUser', {
                    type: 'order',
                    data: UpdateOrder
                });
                res.status(200)
                    .json({
                        data: {
                            Order: UpdateOrder,
                            DeliveryTimeSlot: PageDetail.DeliveryDate
                        },
                        result: MessageResult
                    });
            } else {
                res.status(400)
                    .json(errorJsonResponse('your order has been removed', 'your order has been removed'));
            }
        } else {
            res.status(400)
                .json(errorJsonResponse(`we don't have enough qty for these products ${JSON.stringify(ItemNotFound)}  `, `we don't have enough qty for these products ${JSON.stringify(ItemNotFound)}`));
        }
    } catch(error) {
        res.status(501)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function paymentCallback(req, res, next) {
    const uniqueId = getGuid();
    try {
        Log.writeLog(Log.eLogLevel.info, `[paymentCallback] : ${JSON.stringify(req.body)}`, uniqueId);
        const paymentResponse = req.body;
        if(paymentResponse) {
            const orderId = paymentResponse.data.complete_payment_url;
            if(paymentResponse.type === 'PAYMENT_COMPLETED') {
                let UpdateOrder = await Order.findOneAndUpdate({_id: orderId}, {
                    PaymentStatus: 'paid',
                    PaymentResponse: req.body
                }, {new: true, setDefaultsOnInsert: true});

                let result = await socketPublishMessage(UpdateOrder.FbPageId, {
                    type: 'order',
                    data: UpdateOrder
                });
                result = await socketPublishMessage('AdminUser', {
                    type: 'order',
                    data: UpdateOrder
                });
                Log.writeLog(Log.eLogLevel.info, `[paymentCallback][updateOrder] : ${JSON.stringify(UpdateOrder)}`, uniqueId);

            }
            else {
                let UpdateOrder = await Order.findOneAndUpdate({_id: orderId}, {
                    PaymentResponse: req.body
                }, {new: true, setDefaultsOnInsert: true});
                Log.writeLog(Log.eLogLevel.error, `[paymentCallback][updateOrder] : ${JSON.stringify(UpdateOrder)}`, uniqueId);
            }
        }
        res.status(200)
            .json({});
    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, `[paymentCallback] : ${JSON.stringify(error)}`, uniqueId);
    }
}

export async function checkout(req, res, next) {
    const uniqueId = getGuid();
    try {
        let FindOrder = await Order.findOne({_id: req.params.id});
        Log.writeLog(Log.eLogLevel.info, `[checkout][order] : ${JSON.stringify(FindOrder)}`, uniqueId);
        if(FindOrder) {

            let http_method = 'post';                // Lower case.
            let url_path = '/v1/checkout';    // Portion after the base URL.
            let salt = Math.floor(100000 + Math.random() * 900000000000);  // Randomly generated for each request.
            let timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString(); // Current Unix time.
            let access_key = config.Rapyd.access_key;     // The access key received from Rapyd.
            let secret_key = config.Rapyd.secret_key;     // Never transmit the secret key by itself.

            let body = {
                amount: (FindOrder.Total + FindOrder.ShippingCharge),
                complete_payment_url: FindOrder._id,
                country: 'SG',
                currency: 'SGD',
                error_payment_url: config.Rapyd.error_payment_url,
                payment_method_type: null,
                payment_method_type_categories: [
                    'card',
                    'bank_redirect',
                    'bank_transfer'
                ]
            };

            let to_sign = http_method + url_path + salt + timestamp + access_key + secret_key + JSON.stringify(body);
            let signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(to_sign, secret_key));
            signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(signature));

            const api = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_key': access_key,
                    'salt': salt,
                    'signature': signature,
                    'timestamp': timestamp
                },
                url: 'https://api.rapyd.net/v1/checkout',
                data: body
            };

            Log.writeLog(Log.eLogLevel.info, `[checkout][rapyd][request] : ${JSON.stringify(api)}`, uniqueId);

            axios(api)
                .then(async(response) => {
                    Log.writeLog(Log.eLogLevel.info, `[checkout][rapyd][response] : ${JSON.stringify(response.data)}`, uniqueId);
                    let UpdateOrder = await Order.findOneAndUpdate({_id: FindOrder._id}, {
                        CheckoutResponse: response.data
                    }, {new: true, setDefaultsOnInsert: true});
                    let redirectUrl = response.data.data.redirect_url;
                    res.status(200)
                        .json({redirectUrl});
                })
                .catch((error) => {
                    Log.writeLog(Log.eLogLevel.error, `[checkout][rapyd][response] : ${JSON.stringify(error)}`, uniqueId);
                    res.status(400)
                        .json(errorJsonResponse(error.toString(), error.toString()));
                });

        } else {
            res.status(400)
                .json(errorJsonResponse('your order has been removed', 'your order has been removed'));
        }
    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, `[checkout] : ${JSON.stringify(error)}`, uniqueId);
        res.status(501)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

