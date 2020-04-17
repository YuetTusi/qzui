import { createLogger, transports, format } from 'winston';
import config from '@src/config/ui.yaml';
import path from 'path';

const { combine, timestamp, label, printf } = format;

let loggerPath = null;

const formatLog = printf(({ level, message, label, timestamp }) => {
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
        timestamp({format:'YYYY/MM/DD HH:mm:ss'}),
        formatLog
    ),
    transports: [
        new transports.File({
            filename: loggerPath,
            maxsize: 65536
        })
    ]
});

export default logger;