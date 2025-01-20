"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyShopifyWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Logger_1 = require("../Helpers/Logger");
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
/**
 * This method is used for validating the request is comming for Shopify.
 * Uses HMAC verification to ensure the request is made by Shopify
 * @param route The route where the request was sent
 * @param req The express Request object
 * @param res The express Response object
 * @param next
 * @returns void
 */
const verifyShopifyWebhook = (req, res, next) => {
    const ROUTE = req.baseUrl + req.path;
    try {
        const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
        const rawBody = req.rawBody;
        const hash = crypto_1.default
            .createHmac("sha256", SHOPIFY_API_SECRET)
            .update(rawBody)
            .digest("base64");
        if (hash === hmacHeader) {
            next();
        }
        else {
            (0, Logger_1.routeErrorLogger)(ROUTE, req, "Unauthorized", 401);
            res.status(401).send("Unauthorized");
            return;
        }
    }
    catch (error) {
        (0, Logger_1.routeErrorLogger)(ROUTE, req, error, 500);
        res.status(500).send("Internal Server Error");
        return;
    }
};
exports.verifyShopifyWebhook = verifyShopifyWebhook;
//# sourceMappingURL=WebhookUtils.js.map