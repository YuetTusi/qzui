import { createLogger, transports, format } from 'winston';
import { helper } from '@utils/helper';
import path from 'path';

const { combine, timestamp, label, printf } = format;

let loggerPath = null;

const formatLog = printf(({ level, message, label, timestamp }) => {
    return `[${timestamp}] [${level}]: ${message}`;
});

if (process.env.NODE_ENV === 'development') {
    //NOTE: 开发
    loggerPath = path.resolve('.', helper.getConfig().logFile);
} else {
    //NOTE: 生产
    loggerPath = path.resolve(process.cwd(), helper.getConfig().logFile);
}

const logger = createLogger({
    format: combine(
        timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
        formatLog
    ),
    transports: [
        new transports.File({
            filename: loggerPath,
            maxsize: 262144
        })
    ]
});

export default logger;