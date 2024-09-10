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
const ShopifyClient_1 = __importDefault(require("../ServiceLayer/ShopifyClient"));
//TODO Change the structure of the class, so it can take in an accessToken and a host to be passed down to the ShopifyClient class
/**This data access class is in charge of getting the collections object from the Shopify Database  */
class CollectionsDAO extends ShopifyClient_1.default {
    constructor(accessToken, hostName) {
        super(accessToken, hostName);
    }
    findCollectionById(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.shopify.rest.Collection.find({
                    session: this.session,
                    id: collectionId,
                });
                return response;
            }
            catch (e) {
                console.log(`Error finding collection: ${e.message}`);
            }
        });
    }
    /** This method returns all products for a collection based on collection Id
     * @param {number} collectionId
     */
    getCollectionProducts(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.shopify.rest.Collection.products({
                    session: this.session,
                    id: collectionId,
                });
                return { isSuccess: true, products: response.products };
            }
            catch (e) {
                console.log(`Error getting products from collection ${collectionId}: ${e.message}`);
                throw e;
            }
        });
    }
    getSmartCollectionOnProductId(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = this.shopify.rest.SmartCollection.all({
                    session: this.session,
                    product_id: productId,
                });
                return response;
            }
            catch (e) {
                console.log(`Error getting smart collection by product Id ${productId}: ${e.message}`);
                return null;
            }
        });
    }
}
exports.default = CollectionsDAO;
//# sourceMappingURL=CollectionsDAO.js.map