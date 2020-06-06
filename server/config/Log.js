import moment from 'moment';
import winston from 'winston';
import config from '../config/environment'
require('winston-daily-rotate-file');

class Log {

    // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
    static eLogLevel = {
        error: 'error',
        warn: 'warn',
        info: 'info',
        verbose: 'verbose',
        debug: 'debug',
        silly: 'silly'
    };
    static Log;

    constructor() {
        console.log('Log Successfully Initialized');
    }

    static padRight(str, padString, length) {
        while (str.length < length)
            str = str + padString;
        return str;
    }

    /* Init stackify object and logger objects */
    static logInit() {

        const logFormatter = function (options) {
            // Return string will be passed to logger.
            return '[' + Log.padRight(options.level.toUpperCase(), ' ', 5) + '][' + options.timestamp() + ']- ' +
                (options.message ? options.message : '') +
                (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '' );
        };

        const timestamp = function () {
            return moment(new Date()).format('YYYY-MM-DD hh:mm:ss.SSSSSS');
        };

        let filePath = config.logFile.filePath;
        this.Log = new (winston.Logger)({
            transports: [
                new (winston.transports.DailyRotateFile)({
                    dirname: filePath,
                    filename: './log',
                    datePattern: 'yyyyMMdd-HH.',
                    maxsize: '5242880',  //5MB
                    localTime: true,
                    prepend: true,
                    level: this.eLogLevel.silly,
                    createTree: true,
                    colorize: true,
                    prettyPrint: true,
                    json: false,
                    timestamp: timestamp,
                    formatter: logFormatter
                })
            ]
        });

    }

    /* Write log to file and/or stackify */
    static writeLog(Level, message, uniqueId = null) {
        if (uniqueId)
            this.Log.log(Level, '[' + uniqueId + '] ' + message);
        else
            this.Log.log(Level, message);
    }
}

// export the class
module.exports = Log;
