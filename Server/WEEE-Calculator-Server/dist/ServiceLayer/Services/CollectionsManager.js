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
const ResourceNotFoundException_1 = __importDefault(require("../../ExceptionModels/ResourceNotFoundException"));
class CollectionsManager {
    constructor(collectionsGraphDao, collectionsRestDao) {
        this.collectionsGraphDao = collectionsGraphDao;
        this.collectionsRestDao = collectionsRestDao;
    }
    /**
     * This method creates collections in the vendor's shopify based on a map that is passed as an argument
     * @param {Map<string, string>} collections the key of the map is collection title and the value is the collection description
     */
    //The map should be <title, description>
    createCollectionsFor(collections) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //Iterates over the array of maps
                for (let i = 0; i < collections.length; i++) {
                    //Iterates over a map, part of the array of maps
                    for (let [key, value] of collections[i]) {
                        let result = yield this.collectionsGraphDao.createCollection(key, value);
                        if (!result.isSuccess) {
                            throw new Error(result.error);
                        }
                    }
                }
                return { isSuccess: true };
            }
            catch (e) {
                return { isSuccess: false, error: e.message };
            }
        });
    }
    getWeeeCollectionsId(collectionsNames) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let collectionIds = [];
                for (const collectionName of collectionsNames) {
                    const colId = yield this.collectionsGraphDao.findCollectionIdByName(collectionName);
                    collectionIds.push(Number(colId));
                }
                return { isSuccess: true, collectionIds: collectionIds };
            }
            catch (e) {
                return { isSuccess: false, collectionIds: null, error: e.message };
            }
        });
    }
    /**
     * This method returns a list of all products belonging to a collection
     * @param collectionId
     * @returns { isSuccess: boolean; products: Array<Product>; error?: string }
     */
    getCollectionProducts(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.collectionsRestDao.getCollectionProducts(collectionId);
                if (response.isSuccess) {
                    return { isSuccess: true, products: response.products };
                }
                return { isSuccess: false, products: [] };
            }
            catch (e) {
                console.error("Error in CollectionsManager. Error getting WEEE collections: ", e);
                return { isSuccess: false, products: null, error: e.message };
            }
        });
    }
    /**
     * This method returns only the collections containing "WEEE" in their title
     * The method will return null if no collections containing "WEEE" in their title were found
     * @returns {Array<Collection>} All WEEE collections in vendor's store
     */
    getWeeeCollections() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const collectionsUnFiltered = yield this.collectionsGraphDao.getAllCollections();
                if (collectionsUnFiltered != null) {
                    const collectionsFiltered = collectionsUnFiltered.filter((collection) => collection.title.includes("WEEE"));
                    if (collectionsFiltered.length > 0) {
                        return { isSuccess: true, collections: collectionsFiltered };
                    }
                    else {
                        return { isSuccess: true, collections: [] };
                    }
                }
                return {
                    isSuccess: true,
                    collections: [],
                };
            }
            catch (e) {
                console.error("Error in CollectionsManager. Error getting WEEE collections: ", e);
                return { isSuccess: false, collections: [], error: e.message };
            }
        });
    }
    getCollectionNameById(collectionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.collectionsRestDao.findCollectionById(collectionId);
                if (response) {
                    const title = response.title;
                    return title;
                }
                return null;
            }
            catch (e) {
                throw e;
            }
        });
    }
    getCollectionIdByName(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.collectionsGraphDao.findCollectionIdByName(collectionName);
                if (response != null) {
                    return { isSuccess: true, payload: response };
                }
                throw new ResourceNotFoundException_1.default(`Could not get id for collection: ${collectionName}`);
            }
            catch (e) {
                console.error("Error in CollectionsManager. Error getting collection id", e);
                return { isSuccess: false, payload: null, error: e.message };
            }
        });
    }
    /**
     * This method adds an array of products to a collection.
     * @param collectionId the target collection products will be added to
     * @param products the array of product ids that are to be added
     * @returns { isSuccess: boolean; error?: string } the isSuccess represents whether the action executed successfully or not, the error message represents an error message if any
     */
    addProductsToCollection(collectionId, products) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.collectionsGraphDao.addProductsToCollection(collectionId, products);
                if (response.isSuccess) {
                    return { isSuccess: true };
                }
                return { isSuccess: false, error: "Error adding products to collection" };
            }
            catch (e) {
                console.error("Error in CollectionsManager addProductsToCollection: ", e);
                return { isSuccess: false, error: e.message };
            }
        });
    }
    /**
     * This method removes an array of products from a collection
     * @param collectionId the target collection products will be removed from
     * @param products the array of product ids that are to be removed
     * @returns { isSuccess: boolean; error?: string } the isSuccess represents whether the action executed successfully or not, the error message represents an error message if any
     */
    removeProductsFromCollection(collectionId, products) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.collectionsGraphDao.removeProductsFromCollection(collectionId, products);
                if (response.isSuccess) {
                    return { isSuccess: true };
                }
                return {
                    isSuccess: false,
                    error: "Error removing products from a collection",
                };
            }
            catch (e) {
                console.error("Error in CollectionsManager removeProductsFromCollection: ", e);
                return { isSuccess: false, error: e.message };
            }
        });
    }
}
exports.default = CollectionsManager;
//# sourceMappingURL=CollectionsManager.js.map