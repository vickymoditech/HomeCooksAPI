import Order from './Order.model';
import {errorJsonResponse, getCache, getGuid, KEY_WORDS} from '../../config/commonHelper';
import UserDetail from '../UserDetail/UserDetail.model';
import FbPage from '../FbPages/fbPages.model';
import Keyword from '../keyword/keyword.model';
import {socketPublishMessage} from '../Socket';
import Log from '../../config/Log';
import config from '../../config/environment';
import axios from 'axios/index';

let moment = require('moment-timezone');

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
        let MessageResult = 'Order has been updated';
        delete order._id;
        if(orderStatus !== '') {
            order.Status = orderStatus;
            MessageResult = 'Item has been updated';
        }
        let PageDetail = await FbPage.findOne({FbPageId: order.FbPageId});
        const findOrder = await Order.findOne({_id: OrderId});

        try {
            if(findOrder) {
                order.Total = findOrder.Total;
                let total = 0;

                await Promise.all(order.Items.map(async(singleItem) => {
                    const originalOrderQty = findOrder.Items.find((data) => data.id === singleItem.id);
                    let qty = 0;
                    let updateQty = null;

                    if(originalOrderQty.qty !== singleItem.qty) {
                        if(originalOrderQty.qty < singleItem.qty) {
                            //todo change logic for update
                            qty = singleItem.qty - originalOrderQty.qty;
                            updateQty = await Keyword.findOneAndUpdate(
                                {
                                    _id: singleItem.id,
                                    stock: {$gte: qty},
                                    maxQty: {$gte: singleItem.qty}
                                }, {
                                    $inc: {stock: -qty}
                                }, {new: true});
                            if(updateQty) {
                                total += (updateQty.price * qty);
                                singleItem.total = (updateQty.price * singleItem.qty);
                            } else {
                                throw {
                                    outOfStock: true,
                                    productName: singleItem.itemName
                                };
                            }
                        } else {
                            qty = originalOrderQty.qty - singleItem.qty;
                            updateQty = await Keyword.findOneAndUpdate(
                                {
                                    _id: singleItem.id,
                                }, {
                                    $inc: {stock: +qty}
                                }, {new: true});
                            total += (updateQty.price * -qty);
                            singleItem.total = (updateQty.price * singleItem.qty);
                        }

                        let result = await socketPublishMessage(order.FbPageId, {
                            type: 'keywordUpdate',
                            data: updateQty
                        });

                        result = await socketPublishMessage('AdminUser', {
                            type: 'keywordUpdate',
                            data: updateQty
                        });

                    }
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
                            result: MessageResult,
                            errorResult: null
                        });
                } else {
                    res.status(400)
                        .json(errorJsonResponse('your order has been removed', 'your order has been removed'));
                }
            } else {
                res.status(400)
                    .json(errorJsonResponse('your order has been removed', 'your order has been removed'));
            }
        } catch(error) {
            if(error.outOfStock !== undefined && error.outOfStock !== null && error.outOfStock === true) {
                res.status(200)
                    .json({
                        data: {
                            Order: findOrder,
                            DeliveryTimeSlot: PageDetail.DeliveryDate
                        },
                        result: null,
                        errorResult: `sorry, ${error.productName} is out of stock`
                    });
            } else {
                res.status(501)
                    .json(errorJsonResponse(error.toString(), error.toString()));
            }
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
            const orderId = paymentResponse.data.metadata.orderId;
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
                complete_checkout_url: `${config.Rapyd.complete_checkout_url}/${FindOrder._id}`,
                country: 'SG',
                currency: 'SGD',
                error_payment_url: config.Rapyd.error_payment_url,
                metadata: {
                    orderId: FindOrder._id
                },
                payment_method_type: null,
                payment_method_type_categories: [
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
                url: config.Rapyd.payment_url,
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

export async function importOrder(req, res, next) {
    const uniqueId = getGuid();
    try {
        const FbPageId = req.params.FbPageId;
        const orders = req.body.order;
        const AllKeyWord = getCache(KEY_WORDS);
        let importFailOrders = [];

        Log.writeLog(Log.eLogLevel.info, `[importOrder][importData] : ${JSON.stringify(orders)}`, uniqueId);

        let momentDateTime = moment()
            .tz('Asia/Singapore')
            .format();
        let currentDate = new Date(momentDateTime);

        const FBPageDetail = await FbPage.findOne({FbPageId: FbPageId});

        await Promise.all(orders.map(async(singleOrder, index) => {

            //todo save order send socket message;
            const MinimumOrderValue = FBPageDetail.Minimum;
            let shippingCharge = 0;
            let items = [];
            let Is_save = true;
            let total = 0;

            if(MinimumOrderValue >= singleOrder.totalexcludeshipping) {
                shippingCharge = FBPageDetail.ShippingMinimum;
            }

            if(singleOrder.orderitems !== null) {
                const orderItems = singleOrder.orderitems.split('\n');
                orderItems.map((singleItems) => {
                    if(Is_save) {
                        let getItemsOnly = singleItems.split(': ');
                        getItemsOnly = getItemsOnly[1].split('  x');
                        const qty = Number(getItemsOnly[1]);
                        getItemsOnly = getItemsOnly[0];

                        const matchKeyWord = AllKeyWord.find((data) => data.FbPageId === FbPageId && data.description.trim()
                            .toLowerCase() === getItemsOnly.trim()
                            .toLowerCase());

                        if(matchKeyWord !== null && matchKeyWord !== undefined) {
                            const Item = {
                                id: matchKeyWord._id.toString(),
                                itemName: matchKeyWord.description,
                                qty: qty,
                                price: matchKeyWord.price,
                                keyword: matchKeyWord.keyword,
                                SKU: matchKeyWord.SKU,
                                total: Number(qty * matchKeyWord.price)
                            };
                            total += Item.total;
                            items.push(Item);
                        } else {
                            Is_save = false;
                        }
                    }
                });
            }

            if(Is_save) {
                const OrderFind = await Order.findOne({BoxifyOrderNumber: singleOrder.ordernumber});
                if(!OrderFind) {
                    let ImportOrder = new Order({
                        FbPageId: FbPageId,
                        BoxifyOrderNumber: singleOrder.ordernumber,
                        Items: items,
                        Name: singleOrder.customername,
                        Total: total,
                        Status: 'active',
                        FirstOrderDate: currentDate.toUTCString(),
                        MostRecentOrderDate: currentDate.toUTCString(),
                        ShippingOption: singleOrder.shippingoption,
                        ShippingCharge: shippingCharge,
                        PaymentStatus: 'unpaid',
                        Confirmed: true,
                        Date: currentDate.toUTCString(),
                        ShippingName: singleOrder.shippingname === null ? singleOrder.customername : singleOrder.shippingname,
                        ShippingMobile: singleOrder.shippingphonenumber,
                        ShippingAddress1: singleOrder.shippingaddress1,
                        ShippingAddress2: singleOrder.shippingaddress2,
                        ShippingPostalCode: singleOrder.shippingpostcode
                    });
                    try {
                        const InsertOrder = await ImportOrder.save();

                        let result = await socketPublishMessage(FbPageId, {
                            type: 'order',
                            data: InsertOrder
                        });
                        result = await socketPublishMessage('AdminUser', {
                            type: 'order',
                            data: InsertOrder
                        });

                        Log.writeLog(Log.eLogLevel.info, '[importOrder] : ' + JSON.stringify('Save Successfully'));
                    } catch(error) {
                        Log.writeLog(Log.eLogLevel.info, '[importOrder] : ' + JSON.stringify(error));
                    }
                }
            } else {
                importFailOrders.push(singleOrder);
            }

        }));

        res.status(200)
            .json({
                result: 'your orders have been successfully imported',
                importFailOrders: importFailOrders
            });

    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, `[importOrder] : ${JSON.stringify(error)}`, uniqueId);
        res.status(501)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function orderSearch(req, res, next) {
    const uniqueId = getGuid();
    try {
        let FindOrder = await Order.findOne({BoxifyOrderNumber: req.params.id}, {_id: 1});
        Log.writeLog(Log.eLogLevel.info, `[orderSearch][order] : ${JSON.stringify(FindOrder)}`, uniqueId);
        if(FindOrder) {
            res.status(200)
                .json({
                    orderId: FindOrder
                });
        } else {
            res.status(403)
                .json(errorJsonResponse('Order not found', 'Order not found'));
        }
    } catch(error) {
        Log.writeLog(Log.eLogLevel.error, `[orderSearch] : ${JSON.stringify(error)}`, uniqueId);
        res.status(501)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}
