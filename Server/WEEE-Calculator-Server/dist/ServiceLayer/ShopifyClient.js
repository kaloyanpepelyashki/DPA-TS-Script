"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
require("@shopify/shopify-api/adapters/node");
const shopify_api_1 = require("@shopify/shopify-api");
const _2023_04_1 = require("@shopify/shopify-api/rest/admin/2023-04");
dotenv_1.default.config();
/** This class provides access to the shopify APIs through the shopify client */
class ShopifyClient {
    //TODO The accessToken and hostName should be passed as a constructro parameters
    constructor(accessToken, hostName) {
        this.secretKey = process.env.SHOPIFY_API_SECRET_KEY;
        this.accessToken = accessToken;
        this.hostName = hostName;
        this.shopify = (0, shopify_api_1.shopifyApi)({
            apiSecretKey: this.secretKey,
            apiVersion: shopify_api_1.ApiVersion.January24,
            isCustomStoreApp: true,
            adminApiAccessToken: this.accessToken,
            isEmbeddedApp: false,
            hostName: this.hostName,
            // Mount REST resources.
            restResources: _2023_04_1.restResources,
        });
        this.session = this.shopify.session.customAppSession(this.hostName);
    }
    /**
     *
     * @returns An object containing the an instance of shopify and the session
     */
    getShopifyInstance() {
        return { shopify: this.shopify, session: this.session };
    }
}
exports.default = ShopifyClient;
//# sourceMappingURL=ShopifyClient.js.map