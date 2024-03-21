import CollectionsMap from "./CollectionsMap";
import ProductsSoldMap from "./ProductsSoldMap";

/** This class encapsulates the main logic for calculating the collection's total products sold in weight
 * The class proved a method for calculating the total weight for each collection
 */
class CollectionsTotalWeightMap {
  protected collectionsMap: CollectionsMap;
  protected productsMap: ProductsSoldMap;
  protected weeeCollectionNames: Array<string>;
  private collections: Map<number, number[]>;
  private soldProductsWeight: Map<number, number>;
  constructor() {}

  protected async initialize() {
    try {
      this.collectionsMap = new CollectionsMap(this.weeeCollectionNames);
      this.productsMap = new ProductsSoldMap();
      this.collections = await this.collectionsMap.getDpaCollectionsMap();
      this.soldProductsWeight = await this.productsMap.getSoldProductsWeight();
    } catch (e) {
      console.log(
        `Error initalizing the collections total weight: ${e.message}`
      );
    }
  }

  /** This method calculates the collections total weight.
   * It automatically intialises the objects needed to perform the calculation
   */
  protected async calculateCollectionsTotalWeight() {
    try {
      let collectionsWeight = {};
      await this.initialize();

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
      } else {
        return null;
      }
    } catch (e) {
      console.log(`Error calculating collections total weigh: ${e.message}`);
      return null;
    }
  }

  /**
   * This method returns a Map, encapsulating the collections weight in kilograms.
   * @param collectionNames
   * @returns collectionsTotalWeightMap
   */
  public async getCollectionsTotalWeight(
    collectionNames: Array<string>
  ): Promise<Map<number, number> | null> {
    try {
      //sets the weeeCollectionNames variable
      this.weeeCollectionNames = collectionNames;

      let collectionsTotalWeightMap: Map<number, number> = new Map();
      const rawCollectionsWeight = await this.calculateCollectionsTotalWeight();

      if (rawCollectionsWeight !== null) {
        //Converting the collections weight from grams to kilograms
        Object.keys(rawCollectionsWeight).forEach((collection) => {
          const weightInKilograms = Number(
            (rawCollectionsWeight[collection] / 1000).toFixed(3)
          );
          collectionsTotalWeightMap.set(Number(collection), weightInKilograms);
        });

        if (collectionsTotalWeightMap.size != null) {
          return collectionsTotalWeightMap;
        }
      } else {
        return null;
      }
    } catch (e) {
      console.log(
        `Error getting the total weight for collections: ${e.message}`
      );
      return null;
    }
  }
}

export default CollectionsTotalWeightMap;
