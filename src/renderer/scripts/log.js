const { createLogger, transports, format } = require('winston');
const config = require('../../config/ui.config.json');
const path = require('path');

const { combine, timestamp, printf } = format;

let loggerPath = null;

const formatLog = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}]: ${message}`;
});

if (process.env.NODE_ENV === 'development') {
    //NOTE: 开发
    loggerPath = path.resolve('.', config.logFile);
} else {
    //NOTE: 生产
    loggerPath = path.resolve(process.cwd(), config.logFile);
}

const logger = createLogger({
    format: combine(
        // label({ label: 'right meow!' }),
        timestamp(),
        formatLog
    ),
    transports: [
        new transports.File({
            filename: loggerPath,
            maxsize: 524288
        })
    ]
});

module.exports = logger;