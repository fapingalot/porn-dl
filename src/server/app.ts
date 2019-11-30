import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './environment';
import { GenericError } from './helpers/genric-error';
import indexRouter from './index.route';

//
// Init app
//
const app = express();

//
// Init Middleware
//

if (env.COMPRESSION) { app.use(compression()); }
app.use(helmet());
app.use(morgan('dev'));

if (env.ALLOW_TERMINATION_FROM) {
    app.set('trust proxy', env.ALLOW_TERMINATION_FROM);
}

if (env.CORS.ENABLED) {
    app.use(cors({
        origin: env.CORS.ALLOWED_ORIGINS,
        allowedHeaders: env.CORS.ALLOWED_HEADERS,
        methods: env.CORS.ALLOWED_METHODS,
        exposedHeaders: env.CORS.EXPOSED_HEADERS,
        credentials: env.CORS.ALLOW_CREDENTIALS,
        maxAge: env.CORS.MAX_AGE,
    }));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// TODO add middleware
// TODO csurf
// TODO passportjs

//
// Init routes
//
app.use(indexRouter);

//
// Path error handling
//

// 404 Endpoint not found
app.use((req, res, next) => next(new GenericError('EndpointNotFound', 404, 'Endpoint not found')));

// Error handling
app.use(((err, req, res, next) => {
    if (err instanceof GenericError && err.recoverable) {
        return res.status(err.httpCode || 500).json({
            status: err.httpCode,
            code: err.name,
            message: err.message,
            extra: err.extra,
        });
    }

    throw err; // Crash
}) as express.ErrorRequestHandler);

//
// Export app
//
export default async () => app;
