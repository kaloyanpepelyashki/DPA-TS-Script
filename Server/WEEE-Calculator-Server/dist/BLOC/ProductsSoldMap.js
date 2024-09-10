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
Object.defineProperty(exports, "__esModule", { value: true });
/** This class is a blue print of a Map, that contains both a product Id and the total weight of sold products belonging to it  */
class ProductsSoldMap {
    constructor(ordersManager) {
        this.soldProductsWeightMap = new Map();
        this.ordersManager = ordersManager;
    }
    /**
     * This method initalizes the map and calculates the total product weight sold based on the orders
     * @param startDate the start date of the period (ISO 8601 format)
     * @param endDate the end date of the period (ISO 8601 format)
     * @returns Order[] an array of all orders in the specified time frame
     */
    fetchOrders(startDate, endDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /** Gets all orders from shopify through the ordersDAO*/
                const response = yield this.ordersManager.fetchAllOrdersFor(startDate, endDate, country);
                if (response.isSuccess) {
                    return response.orders;
                }
                return null;
            }
            catch (e) {
                console.log(`Error calculating ProductsSold Map: ${e.message}`);
                throw new Error(`Error fetching products from shopify database: ${e.message}`);
            }
        });
    }
    /**This method calculates the total weight of a product sold. The method then pushes the calculated weight for each product to a map
     * where the key is the product Id and the value is the weight
     */
    calculateSoldProductsWeight(orders) {
        try {
            orders.forEach((order) => {
                const orderProducts = order.products;
                orderProducts.forEach((product) => {
                    const productTotalWeight = product.totalWeight;
                    //Checks if the map has this key already
                    if (this.soldProductsWeightMap.has(product.id)) {
                        //If tha map has the key, it re-calculates the total weight, by adding the current (in the loop) product's weight to the total weight in the map
                        //The weight here is in grams
                        const accumulatedWeight = this.soldProductsWeightMap.get(product.id) + productTotalWeight;
                        this.soldProductsWeightMap.set(product.id, accumulatedWeight);
                    }
                    else {
                        //If the product doesn't exist already, it sets it as a new product
                        this.soldProductsWeightMap.set(product.id, productTotalWeight);
                    }
                });
            });
        }
        catch (e) {
            console.log(`Error calculating sold products total weight: ${e.message}`);
            throw new Error(`Error calculating sold products total weight: ${e.message}`);
        }
    }
    /** This method fetches all orders, calculates the total weight sold for each of the products and returns the data in the formm of a map */
    getSoldProductsWeight(startDate, endDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield this.fetchOrders(startDate, endDate, country);
                if (orders) {
                    this.calculateSoldProductsWeight(orders);
                    if (this.soldProductsWeightMap.size !== 0) {
                        return this.soldProductsWeightMap;
                    }
                }
                return null;
            }
            catch (e) {
                console.log(`Error getting sold products: ${e.message}`);
                throw new Error(`Error getting sold products total weight: ${e.message}`);
            }
        });
    }
}
exports.default = ProductsSoldMap;
//# sourceMappingURL=ProductsSoldMap.js.map