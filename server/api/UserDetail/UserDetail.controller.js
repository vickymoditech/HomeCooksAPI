/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/UserDetails              ->  index
 * POST    /api/UserDetails              ->  create
 * GET     /api/UserDetails/:id          ->  show
 * PUT     /api/UserDetails/:id          ->  upsert
 * PATCH   /api/UserDetails/:id          ->  patch
 * DELETE  /api/UserDetails/:id          ->  destroy
 */

import { applyPatch } from 'fast-json-patch';
import UserDetail from './UserDetail.model';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if(entity) {
            return res.status(statusCode).json(entity);
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
                .then(() => res.status(204).end());
        }
    };
}

function handleEntityNotFound(res) {
    return function(entity) {
        if(!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode).send(err);
    };
}

// Gets a list of UserDetails
export function index(req, res) {
    return UserDetail.find({FbPageId:req.params.FbPageId}).exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a UserDetail from the DB
export function destroy(req, res) {
    return UserDetail.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
