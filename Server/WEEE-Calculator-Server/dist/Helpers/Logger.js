"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalLog = exports.routeResponseLogger = exports.errorLogger = exports.routeErrorLogger = void 0;
const routeErrorLogger = (route, req, error, statusCode = 500) => {
    console.error(`!!!=============!!! \n !>Error: At ${route}. ${error}. Request IP: ${req.ip}`, {
        timestamp: new Date().toISOString(),
        route,
        method: req.method,
        ip: req.ip,
        url: req.url,
        headers: req.headers["user-agent"],
        status: statusCode,
        errorMessage: error.message || error,
        stack: error.stack || null,
    });
};
exports.routeErrorLogger = routeErrorLogger;
const errorLogger = (error) => {
    console.error(`!!!=============!!! \n !>Error: `, {
        timestamp: new Date().toISOString(),
        errorMessage: error.message || error,
        stack: error.stack || null,
    });
};
exports.errorLogger = errorLogger;
const routeResponseLogger = (route, req, message, statusCode) => {
    console.info(`------------- \n >Log: Successful action at ${route}. ${message}`, {
        timestamp: new Date().toISOString(),
        route,
        method: req.method,
        ip: req.ip,
        url: req.url,
        headers: req.headers["user-agent"],
        status: statusCode,
        message: message,
    });
};
exports.routeResponseLogger = routeResponseLogger;
/**
 * A generic log method. The method logs the message passed to the console.
 * The method returns a console log with time stamp.
 * @param message the message string to be logged in the console.
 * @returns void
 */
const generalLog = (message) => {
    if (message.length > 0) {
        console.log(`----------- \n >Log: ${message}`, {
            timestamp: new Date().toISOString(),
        });
    }
    return;
};
exports.generalLog = generalLog;
//# sourceMappingURL=Logger.js.map