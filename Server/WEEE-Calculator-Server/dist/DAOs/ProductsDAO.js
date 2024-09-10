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
/** This class is in charge of retreiving products from the shopify database */
class ProductsDAO extends ShopifyClient_1.default {
    constructor(accesToken, hostName) {
        super(accesToken, hostName);
    }
    /** This method returns a list of all products that belong to a collection
     * @param collectionId:number
     * @returns {Array<Product>} and array of products belonging to a collection
     */
    getProductByCollectionId(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.shopify.rest.Product.all({
                    session: this.session,
                    collection_id: collectionId,
                });
                if (response) {
                    return { isSuccess: true, products: response.data };
                }
                return { isSuccess: false, products: [] };
            }
            catch (e) {
                console.log(`Error getting products from collection ${collectionId}: ${e.message}`);
                throw e;
            }
        });
    }
    getProductByProductId(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.shopify.rest.Product.find({
                    session: this.session,
                    id: productId,
                });
                if (response.length > 0) {
                    return { isSuccess: true, product: response };
                }
                return { isSuccess: false, product: null };
            }
            catch (e) {
                console.log(`Error getting product by id ${productId}: ${e.message}`);
                throw e;
            }
        });
    }
    getProductVariantByVariantId(variantId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.shopify.rest.Variant.find({
                    session: this.session,
                    id: variantId,
                });
                return response;
            }
            catch (e) {
                console.log(`Error getting product variant ${variantId}: ${e.message}`);
                throw e;
            }
        });
    }
    /**
     * This method gets all products from the vendor's store based on the status of the prodcut
     * @param status
     * @returns all products from the vendor's store based on the status
     */
    getProductsList(status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let allProducts = [];
                let sinceId = 0;
                while (true) {
                    const products = yield this.shopify.rest.Product.all({
                        session: this.session,
                        limit: 250,
                        since_id: sinceId,
                        status: status,
                    });
                    //The loop breaks when there are no more products fetched.
                    if (products.data.length === 0) {
                        break;
                    }
                    allProducts.push(...products.data);
                    sinceId = products.data[products.data.length - 1].id; // Updates for next iteration the since_id to the last id from the current iteration
                }
                if (allProducts.length != 0) {
                    return { isSuccess: true, products: allProducts };
                }
                return { isSuccess: false, products: [] };
            }
            catch (e) {
                console.log(`Error getting products from : ${e.message}`);
                throw e;
            }
        });
    }
}
exports.default = ProductsDAO;
//# sourceMappingURL=ProductsDAO.js.map