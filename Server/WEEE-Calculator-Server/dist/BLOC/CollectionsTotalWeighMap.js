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
const CollectionsMap_1 = __importDefault(require("./CollectionsMap"));
const ProductsSoldMap_1 = __importDefault(require("./ProductsSoldMap"));
/** This class encapsulates the main logic for calculating the collection's total products sold in weight
 * The class proved a method for calculating the total weight for each collection
 */
class CollectionsTotalWeightMap {
    constructor(collectionsManager, ordersManager, weeeCollectionNames) {
        this.collectionsManager = collectionsManager;
        this.productsMap = new ProductsSoldMap_1.default(ordersManager);
        this.collectionsMap = new CollectionsMap_1.default(weeeCollectionNames, this.collectionsManager);
    }
    //TODO This method should somehow accept startDate and endDate and pass them to the getSoldProductWeight
    initialize(reportFromDate, reportToDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.collections = yield this.collectionsMap.getDpaCollectionsMap();
                this.soldProductsWeight = yield this.productsMap.getSoldProductsWeight(reportFromDate, reportToDate, country);
            }
            catch (e) {
                console.log(`Error initalizing the collections total weight: ${e.message}`);
            }
        });
    }
    /** This method calculates the collections total weight.
     * It automatically intialises the objects needed to perform the calculation
     */
    calculateCollectionsTotalWeight(reportFromDate, reportToDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let collectionsWeight = {};
                yield this.initialize(reportFromDate, reportToDate, country);
                //Iterates over the collectionsMap to map which product belongs to each collection
                this.collections.forEach((productIdArray, collectionId) => {
                    let totalWeight = 0;
                    this.soldProductsWeight.forEach((productValue, productId) => {
                        if (productIdArray.includes(productId)) {
                            totalWeight += productValue;
                        }
                    });
                    collectionsWeight[collectionId] = totalWeight;
                });
                if (Object.keys(collectionsWeight).length !== 0) {
                    return collectionsWeight;
                }
                else {
                    return null;
                }
            }
            catch (e) {
                console.log(`Error calculating collections total weigh: ${e.message}`);
                return null;
            }
        });
    }
    /**
     * This method converts collections's weights from grams into kilograms
     * @param rawCollectionsWeight
     * @returns a map containing the converted to kilograms collections weights
     */
    convertCollectionsUnit(rawCollectionsWeight) {
        let collectionsTotalWeightMap = new Map();
        //Converting the collections weight from grams to kilograms
        Object.keys(rawCollectionsWeight).forEach((collection) => {
            const weightInKilograms = Number((rawCollectionsWeight[collection] / 1000).toFixed(3));
            collectionsTotalWeightMap.set(Number(collection), weightInKilograms);
        });
        if (collectionsTotalWeightMap.size != null) {
            return collectionsTotalWeightMap;
        }
    }
    /**
     * This method takes in a collection Map<number, number> where the key is collection id
     * The methed gets for each collection its title, based on collection id
     * @param {Map<number, number>} collections
     * @returns {Map<string, number>} collectionName => weight in kilograms
     */
    convertIdToTitle(collections) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //less computational expensive then iterating over the original map and changing its keys
                let convertedMap = new Map();
                for (const [key, value] of collections) {
                    const collectionTitle = yield this.collectionsManager.getCollectionNameById(key);
                    convertedMap.set(collectionTitle, value);
                }
                return convertedMap;
            }
            catch (e) {
                throw new Error(e);
            }
        });
    }
    /**
     * This method returns a Map, encapsulating the collections weight in kilograms.
     * @param reportFromDate (ISO 8601 format)
     * @param reportToDate (ISO 8601 format)
     * @returns {isSuccess: boolean, collectionsTotalWeights: Map<string, number>, error?: string } An isSuccess property, which will be true, if the opperations was a success, collectionsTotalWeights which is the payload returned and optional error
     */
    getCollectionsTotalWeight(reportFromDate, reportToDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rawCollectionsWeight = yield this.calculateCollectionsTotalWeight(reportFromDate, reportToDate, country);
                if (rawCollectionsWeight !== null) {
                    //Converts weights from grams to kilograms
                    let collectionsTotalWeightMap = this.convertCollectionsUnit(rawCollectionsWeight);
                    if (collectionsTotalWeightMap.size != null) {
                        //For each key of the map, converts it from collection id to title
                        const namedMap = yield this.convertIdToTitle(collectionsTotalWeightMap);
                        return { isSuccess: true, collectionsTotalWeights: namedMap };
                    }
                }
                else {
                    return { isSuccess: false, collectionsTotalWeights: null, error: "" };
                }
            }
            catch (e) {
                console.log(`Error getting the total weight for collections: ${e.message}`);
                return {
                    isSuccess: false,
                    collectionsTotalWeights: null,
                    error: e.message,
                };
            }
        });
    }
}
exports.default = CollectionsTotalWeightMap;
//# sourceMappingURL=CollectionsTotalWeighMap.js.map