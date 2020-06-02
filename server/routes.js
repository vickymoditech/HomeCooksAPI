/**
 * Main application routes
 */

import errors from './components/errors';
import path from 'path';
import CronJob from './api/CronJob';

export default function(app) {
    // Insert routes below
    app.use('/api/Orders', require('./api/Order'));
    app.use('/api/keywords', require('./api/keyword'));
    app.use('/api/Oauths', require('./api/Oauth'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the app.html
    app.route('/*')
        .get((req, res) => {
            res.sendFile(path.resolve(`${app.get('appPath')}/app.html`));
        });
}
