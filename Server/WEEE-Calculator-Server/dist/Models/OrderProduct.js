"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = __importDefault(require("./Product"));
/** This class represents the product object being fetched from the Shopify API
 * productId: number - product's id
 *  productTitle: string - product's title
 *  productVariantId: number - product's variant's id
 *  productWeight: number - product's weight in grams
 *  productQuantity: number - product's quantity
 */
class OrderProduct extends Product_1.default {
    constructor(productId, productTitle, productVariantId, productWeight, productQuantity) {
        //The productHandle is optional, so here it's just an empty string
        super(productId, productTitle, productWeight);
        this.productVariantId = productVariantId;
        this.productQuantity = productQuantity;
        this.totalWeight = this.productQuantity * this.weight;
    }
}
exports.default = OrderProduct;
//# sourceMappingURL=OrderProduct.js.map