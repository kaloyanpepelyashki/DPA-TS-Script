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
const CollectionsTotalWeighMap_1 = __importDefault(require("../../BLOC/CollectionsTotalWeighMap"));
const CollectionsManager_1 = __importDefault(require("./CollectionsManager"));
/**
 * A service class with a signle purpose to calculate the collections total weight and return it
 * The class utilises CollectionsManager, CollectionsTotalWeightMap, OrdersDAO
 * The class constructor takes in OrdersDAO, CollectionsDAO, CollectionsGraphDAO
 */
class CollectionsCalaculator {
    constructor(ordersManager, collectionsRestDao, collectionsGraphDao) {
        this.collectionsManager = new CollectionsManager_1.default(collectionsGraphDao, collectionsRestDao);
        this.ordersManager = ordersManager;
    }
    /**
     * The method, main entry point for initializing the collections total weight calculation process.
     * @param {string} collectionsTitles
     * @returns a map where the key is collection title and value is collection weight in kilograms
     */
    calculateCollectionsTotalWeight(collectionsTitles, reportFromDate, reportToDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.collectionsTotalWeightMap = new CollectionsTotalWeighMap_1.default(this.collectionsManager, this.ordersManager, collectionsTitles);
                const collectionsTotalWeights = yield this.collectionsTotalWeightMap.getCollectionsTotalWeight(reportFromDate, reportToDate, country);
                if (collectionsTotalWeights.isSuccess) {
                    return {
                        isSuccess: true,
                        collectionsTotalWeights: collectionsTotalWeights.collectionsTotalWeights,
                    };
                }
                return {
                    isSuccess: true,
                    collectionsTotalWeights: null,
                    error: "Could not get collections total weights",
                };
            }
            catch (e) {
                console.log("Error calculating collections total weight: ", e);
                return {
                    isSuccess: false,
                    collectionsTotalWeights: null,
                    error: e.message,
                };
            }
        });
    }
}
exports.default = CollectionsCalaculator;
//# sourceMappingURL=CollectionsCalculator.js.map