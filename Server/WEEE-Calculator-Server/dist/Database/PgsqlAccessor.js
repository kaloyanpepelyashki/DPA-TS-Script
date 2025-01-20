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
const PGConnection_1 = __importDefault(require("./PGConnection"));
const Logger_1 = require("../Helpers/Logger");
class PgsqlAccessor {
    constructor() {
        try {
            this.client = (0, PGConnection_1.default)();
            this.client
                .connect()
                .then(() => {
                (0, Logger_1.generalLog)("Succesfully connected to PostgreSQL database");
            })
                .catch((err) => console.log("Error connecting to database: ", err));
        }
        catch (e) {
            console.log("Error initialising PgsqlAccessor");
            (0, Logger_1.errorLogger)(e);
        }
    }
    deleteShopRecord() {
        this.client.query("DELETE FROM ");
    }
    /**
     * This method is responsible for checking if the server connects to PGSql (the right database) in production
     */
    databaseConnectionCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.client.query("SELECT 1 AS connection_check");
                return { isSuccess: true };
            }
            catch (e) {
                return { isSuccess: false, errorMessage: e.message, error: e };
            }
        });
    }
}
exports.default = PgsqlAccessor;
//# sourceMappingURL=PgsqlAccessor.js.map