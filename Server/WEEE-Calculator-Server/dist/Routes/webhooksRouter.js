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
const WebhookUtils_1 = require("../Utilities/WebhookUtils");
const webHookRouter = (0, express_1.default)();
/** Requests to delete shop data
 * This route is used by the system for requesting to delete shop data
 */
webHookRouter.post("/shop/redact", WebhookUtils_1.verifyShopifyWebhook, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send("Webhook completed succesfully");
}));
/** Requests to delete customer data
 * This route is used by the system for requesting to delete customer data
 */
webHookRouter.post("/customer/redact", WebhookUtils_1.verifyShopifyWebhook, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ROUTE = req.baseUrl + req.path;
    res.send(`this is the webhooks/${ROUTE}`);
    res.status(200).send("No customer data has been stored");
}));
/** Requests to view stored customer data
 * This route is used by the system for requesting to view stored customer data
 */
webHookRouter.post("/customer/data_request", WebhookUtils_1.verifyShopifyWebhook, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const ROUTE = req.baseUrl + req.path;
}));
exports.default = webHookRouter;
//# sourceMappingURL=webhooksRouter.js.map