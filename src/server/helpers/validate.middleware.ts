import { RequestHandler } from 'express';
import Joi from 'joi';
import { GenericError } from './genric-error';

export class ValidationError extends GenericError {
    constructor(message: string, extra?: any) {
        super('ValidationError', 400, message, extra, true);
    }
}

export const validateBody = (schema: Joi.SchemaLike): RequestHandler => (req, res, next) => {
    const { error, value } = Joi.validate(
        req.body,
        schema,
        { stripUnknown: true },
    );
    if (error) {
        console.error(error);
        return next(new ValidationError(error.message));
    }

    // Overrides the default body
    if (!req.body) { req.body = {}; }
    req.body = value;
    next();
};

export const validateQuery = (schema: Joi.SchemaLike): RequestHandler => (req, res, next) => {
    const { error, value } = Joi.validate(
        req.query,
        schema,
        { stripUnknown: true },
    );
    if (error) {
        console.error(error);
        return next(new ValidationError(error.message));
    }

    // Overrides the default query
    if (!req.query) { req.query = {}; }
    req.query = value;
    next();
};
