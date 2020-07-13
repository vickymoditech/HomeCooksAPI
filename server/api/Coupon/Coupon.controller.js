/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/Coupons              ->  index
 * POST    /api/Coupons              ->  create
 * GET     /api/Coupons/:id          ->  show
 * PUT     /api/Coupons/:id          ->  upsert
 * PATCH   /api/Coupons/:id          ->  patch
 * DELETE  /api/Coupons/:id          ->  destroy
 */

import {applyPatch} from 'fast-json-patch';
import Coupon from './Coupon.model';
import {errorJsonResponse} from '../../config/commonHelper';
import Keyword from '../keyword/keyword.model';

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

function patchUpdates(patches) {
    return function(entity) {
        try {
            applyPatch(entity, patches, /*validate*/ true);
        } catch(err) {
            return Promise.reject(err);
        }

        return entity.save();
    };
}

function removeEntity(res) {
    return function(entity) {
        if(entity) {
            return entity.remove()
                .then(() => res.status(204)
                    .end());
        }
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

// Gets a single Coupon from the DB
export function show(req, res) {
    return Coupon.find({FbPageId: req.params.id})
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Coupon in the DB
export async function create(req, res) {
    try {
        const find = await Coupon.findOne({FbPageId: req.body.FbPageId, PromoCode: req.body.PromoCode});
        if(find) {
            res.status(400)
                .json(errorJsonResponse('This Coupon already has been registered', 'This Coupon already has been registered'));
        } else {
            Coupon.create(req.body)
                .then(async(InsertKeywords, err) => {
                    if(!err) {
                        res.status(200)
                            .json({data: InsertKeywords, result: 'Save Successfully'});
                    } else {
                        res.status(400)
                            .json(errorJsonResponse(err.toString(), err.toString()));
                    }
                });
        }
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

// Upserts the given Coupon in the DB at the specified ID
export async function update(req, res) {
    try {
        const find = await Coupon.findOne({FbPageId: req.body.FbPageId, PromoCode: req.body.PromoCode});
        if(find) {
            res.status(400)
                .json(errorJsonResponse('This Coupon already has been registered', 'This Coupon already has been registered'));
        } else {
            Coupon.findOneAndUpdate({_id: req.body._id}, {
                    PromoCode: req.body.PromoCode,
                    DiscountAmount: req.body.DiscountAmount,
                }, {new: true}
            )
                .then(async(UpdateKeywords, err) => {
                    if(!err) {
                        res.status(200)
                            .json({data: UpdateKeywords, result: 'Update Successfully'});
                    } else {
                        res.status(400)
                            .json(errorJsonResponse(err.toString(), err.toString()));
                    }
                });
        }
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }

}

// Deletes a Coupon from the DB
export function destroy(req, res) {
    try {
        Coupon.deleteMany({_id: {$in: req.body.keywords}})
            .then(async(DeleteData, err) => {
                if(!err) {
                    if(DeleteData.deletedCount > 0) {
                        res.status(200)
                            .json({result: req.body.keywords});
                    } else {
                        res.status(200)
                            .json({result: []});
                    }
                } else {
                    res.status(400)
                        .json(errorJsonResponse(err.toString(), err.toString()));
                }
            });
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}
