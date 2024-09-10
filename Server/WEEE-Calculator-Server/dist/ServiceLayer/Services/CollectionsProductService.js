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
const CollectionsManager_1 = __importDefault(require("./CollectionsManager"));
class CollectionProductService {
    constructor(collectionGraphDao, collectionRestDao) {
        this.collectionsManager = new CollectionsManager_1.default(collectionGraphDao, collectionRestDao);
    }
    addProductsToCollection(collectionId, products) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.collectionsManager.addProductsToCollection(collectionId, products);
                if (result.isSuccess) {
                    return { isSuccess: true };
                }
                return result;
            }
            catch (e) {
                console.error("Error in CollectionsProductService, addProductsToCollection: ", e);
                return { isSuccess: true, error: e.message };
            }
        });
    }
    removeProductsFromCollection(collectionId, products) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.collectionsManager.removeProductsFromCollection(collectionId, products);
                if (result.isSuccess) {
                    return { isSuccess: true };
                }
                return { isSuccess: false, error: result.error };
            }
            catch (e) {
                console.error("Error in CollectionsProductService, removeProductsFromCollection: ", e);
                return { isSuccess: false, error: e };
            }
        });
    }
}
exports.default = CollectionProductService;
//# sourceMappingURL=CollectionsProductService.js.map