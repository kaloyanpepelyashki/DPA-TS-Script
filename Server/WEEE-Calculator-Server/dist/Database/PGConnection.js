"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PGSQL_USERNAME = "";
const PGSQL_PASSWORD = "";
const PGSQL_HOST = "";
const PGSQL_PORT = 0;
const PGSQL_DB_NAME = "";
function initConnection() {
    try {
        const dbConnectionObject = {
            user: PGSQL_USERNAME,
            password: PGSQL_PASSWORD,
            host: PGSQL_HOST,
            port: PGSQL_PORT,
            database: PGSQL_DB_NAME,
        };
        const client = new pg_1.Client(dbConnectionObject);
        return client;
    }
    catch (e) {
        throw e;
    }
}
exports.default = initConnection;
//# sourceMappingURL=PGConnection.js.map