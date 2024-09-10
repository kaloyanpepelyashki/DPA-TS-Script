"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** This class is a model of the Product object being fetched from Shopify API */
class Product {
    constructor(productId, productTitle, productWeight, productHandle, productImageId, productImageUrl) {
        this.id = productId;
        this.title = productTitle;
        this.weight = productWeight;
        this.handle = productHandle ? productHandle : "";
        this.imageId = productImageId ? productImageId : 0;
        this.imageUrl = productImageUrl ? productImageUrl : "";
    }
}
exports.default = Product;
//# sourceMappingURL=Product.js.map