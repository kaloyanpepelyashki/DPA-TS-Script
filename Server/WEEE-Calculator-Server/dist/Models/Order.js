"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** This class represents the order object being fetched from the Shopify API */
class Order {
    /** @param {Array<Product>} products */
    constructor(products) {
        this.products = [];
        products ? (this.products = products) : (this.products = []);
    }
    /** This method is intended for pushing products to the products array of the Order object
     * @param {Product} product
     */
    pushProduct(product) {
        this.products.push(product);
    }
}
exports.default = Order;
//# sourceMappingURL=Order.js.map