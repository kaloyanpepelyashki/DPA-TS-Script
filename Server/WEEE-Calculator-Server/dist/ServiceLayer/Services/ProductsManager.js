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
const Product_1 = __importDefault(require("../../Models/Product"));
class ProductsManager {
    constructor(productsDao) {
        this.productsDao = productsDao;
    }
    /**
     * This method queries the Shopify REST API and returns all active products in the vendors's store
     * @returns {Array<Product>} An array of all active products
     */
    getAllActiveProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.productsDao.getProductsList("active");
                if (result.isSuccess) {
                    let productList = result.products.map((productItem) => {
                        console.log("product images[]", productItem.images);
                        return new Product_1.default(productItem.id, productItem.title, productItem.variants[0].grams, productItem.handle, productItem.images.length > 0 ? productItem.images[0].id : 0, productItem.images.length > 0 ? productItem.images[0].src : "");
                    });
                    return { isSuccess: true, products: productList };
                }
                else {
                    return { isSuccess: false, products: [] };
                }
            }
            catch (e) {
                console.log(e);
                return { isSuccess: false, products: [], error: e.message };
            }
        });
    }
    /**
     * This method queries the Shopify REST API and gets the product requested by product id
     * @param {number} productId
     * @returns { isSuccess: boolean; product: any; error?: string }
     */
    getProductByProductId(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.productsDao.getProductByProductId(productId);
                if (result.isSuccess) {
                    return { isSuccess: true, product: result.product };
                }
                return {
                    isSuccess: false,
                    product: null,
                    error: "Product was not found",
                };
            }
            catch (e) {
                console.log("Error in ProductsManager. Error getting product by id: ", e);
                return { isSuccess: false, product: null, error: e.message };
            }
        });
    }
    /** This method queries the Shopify REST API and gets a list of produduct, belonging to a collection
     * The method requires a collection id of the collection which products are to be fetched
     * @param {number} collectionId
     * @returns { isSuccess: boolean; products: Array<Product>; error?: string } Success status, an array of all products belonging to the collection and an error mmessage if any
     */
    getProductsForCollection(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Here the DAO calls the Shopify API and initialises the fetch;
                const response = yield this.productsDao.getProductByCollectionId(collectionId);
                if (response.isSuccess) {
                    const productsList = response.products.map((product) => new Product_1.default(product.id, product.title, product.variants[0].grams, product.handle, product.images.length > 0 ? product.images[0].id : 0, product.images.length > 0 ? product.images[0].src : ""));
                    return { isSuccess: true, products: productsList };
                }
                else {
                    return {
                        isSuccess: false,
                        products: [],
                        error: `No products were found for collection: ${collectionId}`,
                    };
                }
            }
            catch (e) {
                console.log(e);
                return { isSuccess: false, products: [], error: e.message };
            }
        });
    }
}
exports.default = ProductsManager;
//# sourceMappingURL=ProductsManager.js.map