const path = require('path');
const { createLogger, transports, format } = require('winston');

const { combine, timestamp, printf } = format;

let loggerPath = null;

const formatLog = printf(({ level, message, timestamp }) => {
	return `[${timestamp}] [${level}]: ${message}`;
});

if (process.env.NODE_ENV === 'development') {
	//NOTE: 开发
	loggerPath = './log/renderer.log';
} else {
	//NOTE: 生产
	loggerPath = path.resolve(process.cwd(), './log/renderer.log');
}

const logger = createLogger({
	format: combine(timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }), formatLog),
	transports: [
		new transports.File({
			filename: loggerPath,
			maxsize: 524288
		})
	]
});

module.exports = logger;
