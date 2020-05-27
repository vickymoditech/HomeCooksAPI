/**
 * Main application file
 */

import express from 'express';
import mongoose from 'mongoose';
let passport = require('passport');

mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';

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
var server = http.createServer(app);

app.use(passport.initialize());
app.use(passport.session());

expressConfig(app);
registerRoutes(app);

// Start server
function startServer() {
    app.angularFullstack = server.listen(config.port, config.ip, function() {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    });
}


setImmediate(startServer);

// Expose app
exports = module.exports = app;
