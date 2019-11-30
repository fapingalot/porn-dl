// tslint:disable-next-line: no-var-requires
require('dotenv').config();

//
// Error handling
//
import { GenericError } from './helpers/genric-error';

process.on('unhandledRejection', (reason, p) => {
    throw reason;
});

process.on('uncaughtException', (error) => {
    if (error instanceof GenericError) {
        if (error.recoverable) {
            console.error('An error accured', error.stack);
            return;
        }
    }

    console.error('An unrecoverable error occured', error.stack);
    process.exit(-1);
});

//
// Run script
//

import { readFileSync } from 'fs';
import https from 'https';
import env from './environment';

import app from './app';

//
// Handle run chain
//
(async () => {
    let server: any = await app();

    server.set('PORT', env.PORT);

    // Handle SSL
    if (env.SSL.ENABLED) {
        server = https.createServer({
            cert: readFileSync(env.SSL.CERT_PATH),
            key: readFileSync(env.SSL.KEY_PATH),
        }, server);
    }

    // Start
    await new Promise((res) => server.listen(env.PORT, res));
    console.log(`Listening on port ${env.PORT} ...`);
    console.log(`Access on '${env.PUBLIC_URL}'.`);
    console.log('Ctrl-C to exit.');
})();
