"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PgsqlAccessor_1 = __importDefault(require("../Database/PgsqlAccessor"));
const Logger_1 = require("../Helpers/Logger");
const healthRouter = (0, express_1.default)();
healthRouter.get("/database", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, Logger_1.generalLog)(`Database healtch check was requested by ip: ${req.ip}`);
        const health = {
            status: " ",
            timeStamp: new Date().toISOString(),
        };
        const pgSqlAccessor = new PgsqlAccessor_1.default();
        const databaseHealthCheck = yield pgSqlAccessor.databaseConnectionCheck();
        if (databaseHealthCheck.isSuccess) {
            health.status = "Connected";
            res.status(200).send(health);
        }
        (0, Logger_1.errorLogger)(databaseHealthCheck.error);
        health.status = "Not connected";
        res.status(500).send(health);
    }
    catch (error) {
        (0, Logger_1.errorLogger)(error);
        res.status(500).send("Internal server error");
    }
}));
/**
 * This route initiates a health check on the server.
 * The routes sends to the consumer an object with inormation about the health check.
 */
healthRouter.get("/server", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, Logger_1.generalLog)(`Server health check was requested by ${req.ip}`);
    const health = {
        message: "",
        status: "online",
        uptime: process.uptime(),
        timeStamp: new Date().toISOString(),
        dependencies: {
            database: {
                status: "",
                error: "",
            },
        },
    };
    try {
        const pgSqlAccessor = new PgsqlAccessor_1.default();
        const databaseHealthCheck = yield pgSqlAccessor.databaseConnectionCheck();
        if (databaseHealthCheck.isSuccess) {
            health.dependencies.database.status = "Connected";
            health.message = "Server is healthy";
            res.status(200).send(health);
        }
        health.dependencies.database.status = "Not connected";
        health.dependencies.database.error = databaseHealthCheck.errorMessage;
        res.status(200).send(health);
    }
    catch (e) {
        res.status(500).send("Internal server error");
    }
}));
exports.default = healthRouter;
//# sourceMappingURL=HealthRouter.js.map