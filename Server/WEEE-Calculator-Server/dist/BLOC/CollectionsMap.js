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
/** This class is a blue print of a Map, that contains both a collection Id and the products belonging to it */
class CollectionsMap {
    constructor(collectionNames, collectionsManager) {
        this.dpaCollectionsMap = new Map();
        this.weeeCollectionIds = [
            608081805635, 608081871171, 608081674563, 608081641795,
        ];
        this.weeeCollectionNames = collectionNames;
        this.collectionsManager = collectionsManager;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const collectionIdsResponse = yield this.collectionsManager.getWeeeCollectionsId(this.weeeCollectionNames);
                if (collectionIdsResponse.isSuccess) {
                    this.weeeCollectionIds = collectionIdsResponse.collectionIds;
                    const result = yield this.updateCollectionsMap();
                    if (result === null) {
                        return null;
                    }
                }
                throw new Error("Error initialising collections map");
            }
            catch (e) {
                console.log(`Error initalising collections map: ${e.message}`);
                return null;
            }
        });
    }
    //
    updateCollectionsMap() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const collectionId of this.weeeCollectionIds) {
                    const collectionProducts = yield this.collectionsManager.getCollectionProducts(collectionId);
                    const productsArray = [];
                    collectionProducts.products.forEach((product) => {
                        productsArray.push(product.id);
                    });
                    this.dpaCollectionsMap.set(collectionId, productsArray);
                }
            }
            catch (e) {
                console.log(`Error composing collections map: ${e.message}`);
                throw e;
            }
        });
    }
    /** This method, when called, initises the Map that holds the collections' ids and each product id belonging to this collection, the method then returns the collections map */
    getDpaCollectionsMap() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.initialize();
                return this.dpaCollectionsMap;
            }
            catch (e) {
                console.log(`Error getting DPA collections: ${e.message}`);
                throw e;
            }
        });
    }
}
exports.default = CollectionsMap;
//# sourceMappingURL=CollectionsMap.js.map