"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProductsDAO_1 = __importDefault(require("../DAOs/ProductsDAO"));
const OrdersDAO_1 = __importDefault(require("../DAOs/OrdersDAO"));
const CollectionsDAO_1 = __importDefault(require("../DAOs/CollectionsDAO"));
const CollectionsGraphDAO_1 = __importDefault(require("../DAOs/CollectionsGraphDAO"));
const OrdersGraphDAO_1 = __importDefault(require("../DAOs/OrdersGraphDAO"));
/**
 * A factory class for the different Dao modules
 * The class constructor expects parameters string accessToken and string hostName.
 * The accessToken and hostName are passed to the different DAO objects when instantiating them
 */
class DaoFactory {
    constructor(accessToken, hostName) {
        this.accessToken = accessToken;
        this.hostName = hostName;
    }
    /**
     * getDao method
     * The method is in charge for returning whichever DAO instance is needed
     * @param {string} daoType {"productsDao" | "ordersDao" | "ordersGraphDao" | "collectionsRestDao" | collectionsGraphDao};
     * @returns {ProductsDAO | OrdersDAO | OrdersGraphDAO | CollectionsDAO | CollectionsGraphDAO}
     */
    getDAO(daoType) {
        switch (daoType) {
            case "productsDao":
                return new ProductsDAO_1.default(this.accessToken, this.hostName);
            case "ordersDao":
                return new OrdersDAO_1.default(this.accessToken, this.hostName);
            case "ordersGraphDao":
                return new OrdersGraphDAO_1.default(this.accessToken, this.hostName);
            case "collectionsRestDao":
                return new CollectionsDAO_1.default(this.accessToken, this.hostName);
            case "collectionsGraphDao":
                return new CollectionsGraphDAO_1.default(this.accessToken, this.hostName);
            default:
                throw new Error(`Invalid DAO type input: ${daoType}`);
        }
    }
}
exports.default = DaoFactory;
//# sourceMappingURL=DaoFactory.js.map