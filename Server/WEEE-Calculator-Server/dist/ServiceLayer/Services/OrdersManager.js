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
//TODO Add the methods from both of the DAOs to the manager
class OrdersManager {
    constructor(ordersDao, orderGraphDao) {
        this.ordersDao = ordersDao;
        this.ordersGraphDao = orderGraphDao;
    }
    //TODO This method needs to filter out the orders based on country of origin as well.
    fetchAllOrdersFor(fromDate, toDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.ordersDao.getOrdersBetween(fromDate, toDate, country);
                if (response != null) {
                    return { isSuccess: true, orders: response.orders };
                }
                return { isSuccess: false, orders: [] };
            }
            catch (e) {
                console.log("Error in OrdersManager: Error fetching orders: ", e);
                return { isSuccess: false, orders: [], error: e.message };
            }
        });
    }
    getShopOrdersCountFor(fromDate, toDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.ordersGraphDao.getOrdersCountFor(fromDate, toDate, country);
                if (response.isSuccess) {
                    return { isSuccess: true, count: response.count };
                }
                return { isSuccess: false, count: 0 };
            }
            catch (e) {
                console.log("Error in OrdersManager: Error getting orders count: ", e);
                return { isSuccess: false, count: 0, error: e.message };
            }
        });
    }
}
exports.default = OrdersManager;
//# sourceMappingURL=OrdersManager.js.map