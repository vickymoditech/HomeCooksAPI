import Orders from './orders.model';

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

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode)
            .send(err);
    };
}

export function index(req, res, next) {
    return Orders.find({})
        .exec()
        .then(respondWithResult(res, 200))
        .catch(handleError(res));
}
