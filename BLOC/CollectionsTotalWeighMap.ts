import CollectionsMap from "./CollectionsMap";
import ProductsSoldMap from "./ProductsSoldMap";

/** This class encapsulates the main logic for calculating the collection's total products sold in weight
 * The class proved a method for calculating the total weight for each collection
 */
class CollectionsTotalWeightMap {
  collectionsMap: CollectionsMap = new CollectionsMap();
  productsMap: ProductsSoldMap = new ProductsSoldMap();
  private collections: Map<number, number[]>;
  private soldProductsWeight: Map<number, number>;
  constructor() {}

  protected async initialize() {
    try {
      this.collections = await this.collectionsMap.getDpaCollectionsMap();
      this.soldProductsWeight = await this.productsMap.getSoldProductsWeight();
    } catch (e) {
      console.log(
        `Error initalizing the collections total weight: ${e.message}`
      );
    }
  }

  public async getCollectionsTotalWeight() {
    try {
      let collectionsTotalWeightMap: Map<number, number> = new Map();
      await this.initialize();

      this.collections.forEach((productIdArray, collectionId) => {
        let totalWeight = 0;
        this.soldProductsWeight.forEach((productValue, productId) => {
          if (productIdArray.includes(productId)) {
            totalWeight += productValue;
          }
        });
        collectionsTotalWeightMap.set(collectionId, totalWeight);
      });

      return collectionsTotalWeightMap;
    } catch (e) {
      console.log(
        `Error getting the total weight for collections: ${e.message}`
      );
    }
  }
}

export default CollectionsTotalWeightMap;
