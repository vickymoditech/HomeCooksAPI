import Keyword from './keyword.model';
import {errorJsonResponse, setCache, KEY_WORDS} from '../../config/commonHelper';

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

// Gets a list of Keywords
export async function index(req, res) {
    try {
        const allKeywords = await Keyword.find({FbPageId: req.params.id}).exec();
        res.status(200).json(allKeywords);
    } catch(error) {
        res.status(500)
            .json(errorJsonResponse(error.toString(), error.toString()));
    }
}

export async function GetallKeywords() {
    try {
        const allKeywords = await Keyword.find({}).exec();
        setCache(KEY_WORDS, allKeywords);
        return allKeywords;
    } catch(error) {
        console.log(error);
        return null;
    }
}

// Creates a new Keyword in the DB
export async function create(req, res) {
    try {
        Keyword.create(req.body)
            .then(async(InsertKeywords, err) => {
                if(!err) {
                    await GetallKeywords();
                    res.status(200)
                        .json({data: InsertKeywords, result: 'Save Successfully'});
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

// Deletes a Keyword from the DB
export function destroy(req, res) {
    try {
        Keyword.deleteMany({_id: {$in: req.body.keywords}})
            .then(async(DeleteData, err) => {
                if(!err) {
                    if(DeleteData.deletedCount > 0) {
                        await GetallKeywords();
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
