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
const Order_1 = __importDefault(require("../Models/Order"));
const OrderProduct_1 = __importDefault(require("../Models/OrderProduct"));
/** A class that is in charge of getting the orders objects from the Shopify database
 * The class extends the ShopifyClient client class and thus has access to all members part of the ShopifyClient class
 */
class OrdersDAO extends ShopifyClient_1.default {
    constructor(accessToken, hostName) {
        super(accessToken, hostName);
    }
    /** This method returns the whole orders object
     * @param {string} date: string (ISO 8601)
     * @param {nummber} limit(the limit of products shown)
     */
    getOrdersOBJAfter(date, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.shopify.rest.Order.all({
                    session: this.session,
                    status: "closed",
                    created_at_min: date,
                    limit: limit,
                });
                return response;
            }
            catch (e) {
                console.log(`Error retreiving orders: ${e}`);
                return null;
            }
        });
    }
    /** This method returns an array of OrderProduct objects, containing an array of objects, representing each order's product that fit the condition of being ordered after the specific date
     * @param {string} fromDate  (ISO 8601 format)
     * @param {string} toDate (ISO 8601 format)
     */
    getOrdersBetween(fromDate, toDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.fetchAllOrdersBetween(fromDate, toDate);
                if (!response.isSuccess) {
                    return { isSuccess: false, orders: null };
                }
                if (response.isSuccess && response.allOrders.length > 0) {
                    let ordersArray = [];
                    response.allOrders.forEach((order) => {
                        if (order.billing_address.country === country) {
                            const orderItem = new Order_1.default();
                            order.line_items.forEach((lineItem) => {
                                const product = new OrderProduct_1.default(lineItem.product_id, lineItem.title, lineItem.variant_id, lineItem.grams, lineItem.quantity);
                                orderItem.pushProduct(product);
                            });
                            ordersArray.push(orderItem);
                        }
                        else {
                            return;
                        }
                    });
                    return { isSuccess: true, orders: ordersArray };
                }
                return { isSuccess: false, orders: null };
            }
            catch (e) {
                console.log(`Error retreiving products: ${e}`);
                throw e;
            }
        });
    }
    /** This method fetches all orders for the specified period */
    fetchAllOrdersBetween(fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let allOrders = [];
                let sinceId = 0;
                while (true) {
                    const orders = yield this.shopify.rest.Order.all({
                        session: this.session,
                        limit: 250,
                        status: "closed",
                        created_at_min: fromDate,
                        created_at_max: toDate,
                        since_id: sinceId,
                    });
                    //The loop breaks when there are no more orders fetched (the orders are over for the period).
                    if (orders.data.length === 0) {
                        break;
                    }
                    allOrders.push(...orders.data);
                    sinceId = orders.data[orders.data.length - 1].id; // Updates for next iteration the since_id to the last id from the current iteration
                }
                if (allOrders.length > 0) {
                    return { isSuccess: true, allOrders: allOrders };
                }
                return { isSuccess: false, allOrders: null };
            }
            catch (e) {
                console.log(`Error getting more than 250 products: ${e.message}`);
                throw e;
            }
        });
    }
    getOrdersCountFor(fromDate, toDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.shopify.rest.Order.count({
                    session: this.session,
                    status: "any",
                    created_at_min: fromDate,
                    created_at_max: toDate,
                });
                if (response.status == 200) {
                    return { isSuccess: true, count: response.count };
                }
                return { isSuccess: false, count: null };
            }
            catch (e) {
                console.log("Error getting orders count");
                throw e;
            }
        });
    }
}
exports.default = OrdersDAO;
//# sourceMappingURL=OrdersDAO.js.map