import Order from './Order.model';
import {errorJsonResponse} from '../../config/commonHelper';
import UserDetail from '../UserDetail/UserDetail.model';
import FbPage from '../FbPages/fbPages.model';
import Keyword from '../keyword/keyword.model';
import {socketPublishMessage} from '../Socket';

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

        const findOrder = await Order.findOne({_id: OrderId});
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
                    keyword: updateQty
                });

                result = await socketPublishMessage('AdminUser', {
                    type: 'keywordUpdate',
                    keyword: updateQty
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
            let UpdateOrder = await Order.findOneAndUpdate({_id: OrderId}, order, {new: true, setDefaultsOnInsert: true});
            if(UpdateOrder) {
                let PageDetail = await FbPage.findOne({FbPageId: order.FbPageId});
                let result = await socketPublishMessage(UpdateOrder.FbPageId, UpdateOrder);
                result = await socketPublishMessage('AdminUser', UpdateOrder);
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
