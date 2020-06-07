/**
 * Main application file
 */

import express from 'express';
import mongoose from 'mongoose';
import {socketOpen} from '../server/api/Socket';
import Log from './config/Log';

let passport = require('passport');

mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';

let https = require('https');
const fs = require('fs');

import expressConfig from './config/express';
import registerRoutes from './routes';
import cors from 'cors';


// Connect to MongoDB
mongoose.connect(config.mongo.uri, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('error', function(err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(-1); // eslint-disable-line no-process-exit
});

// Setup server
var app = express();
app.use(cors());

let privateKey = fs.readFileSync('/etc/letsencrypt/live/live.thevelocitee.com/privkey.pem').toString();
let certificate = fs.readFileSync('/etc/letsencrypt/live/live.thevelocitee.com/fullchain.pem').toString();
let credentials = {
    key: privateKey, cert: certificate,
    requestCert: false,
    rejectUnauthorized: true
};

let server = https.createServer(credentials, app);
//var server = http.createServer(app);


app.use(passport.initialize());
app.use(passport.session());

socketOpen(server);
console.log('socket connection successfully created');
expressConfig(app);
registerRoutes(app);

// Start server
function startServer() {

    new Log();
    Log.logInit();

    app.angularFullstack = server.listen(config.port, config.ip, function() {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
        Log.writeLog(Log.eLogLevel.info, 'Express server listening on ' + config.port + ', in ' + app.get('env') + ' mode');
    });
}


setImmediate(startServer);

// Expose app
exports = module.exports = app;
