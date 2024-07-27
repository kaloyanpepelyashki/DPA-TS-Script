import CollectionsMap from "./CollectionsMap";
import ProductsSoldMap from "./ProductsSoldMap";
import CollectionsManager from "../ServiceLayer/Services/CollectionsManager";
import OrdersDAO from "../DAOs/OrdersDAO";

/** This class encapsulates the main logic for calculating the collection's total products sold in weight
 * The class proved a method for calculating the total weight for each collection
 */
class CollectionsTotalWeightMap {
  protected collectionsManager: CollectionsManager;
  protected collectionsMap: CollectionsMap;
  protected productsMap: ProductsSoldMap;
  private collections: Map<number, number[]>;
  private soldProductsWeight: Map<number, number>;
  constructor(
    collectionsManager: CollectionsManager,
    ordersDao: OrdersDAO,
    weeeCollectionNames: Array<string>
  ) {
    this.collectionsManager = collectionsManager;
    this.productsMap = new ProductsSoldMap(ordersDao);
    this.collectionsMap = new CollectionsMap(
      weeeCollectionNames,
      this.collectionsManager
    );
  }

  //TODO This method should somehow accept startDate and endDate and pass them to the getSoldProductWeight
  protected async initialize(
    reportFromDate: string,
    reportToDate: string,
    country: string
  ) {
    try {
      this.collections = await this.collectionsMap.getDpaCollectionsMap();
      this.soldProductsWeight = await this.productsMap.getSoldProductsWeight(
        reportFromDate,
        reportToDate,
        country
      );
    } catch (e) {
      console.log(
        `Error initalizing the collections total weight: ${e.message}`
      );
    }
  }

  /** This method calculates the collections total weight.
   * It automatically intialises the objects needed to perform the calculation
   */
  protected async calculateCollectionsTotalWeight(
    reportFromDate: string,
    reportToDate: string,
    country: string
  ) {
    try {
      let collectionsWeight = {};
      await this.initialize(reportFromDate, reportToDate, country);

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
   * This method converts collections's weights from grams into kilograms
   * @param rawCollectionsWeight
   * @returns a map containing the converted to kilograms collections weights
   */
  protected convertCollectionsUnit(rawCollectionsWeight): Map<number, number> {
    let collectionsTotalWeightMap: Map<number, number> = new Map();
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
  }

  /**
   *
   * @param {Map<number, number>} collections
   * @returns {Map<string, number>} collectionName => weight in kilograms
   */
  protected async convertIdToTitle(
    collections: Map<number, number>
  ): Promise<Map<string, number>> {
    try {
      //less computational expensive then iterating over the original map and changing its keys
      let convertedMap: Map<string, number> = new Map();

      for (const [key, value] of collections) {
        const collectionTitle: string =
          await this.collectionsManager.getCollectionNameById(key);

        convertedMap.set(collectionTitle, value);
      }

      return convertedMap;
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * This method returns a Map, encapsulating the collections weight in kilograms.
   * @param reportFromDate (ISO 8601 format)
   * @param reportToDate (ISO 8601 format)
   * @returns collectionsTotalWeightMap
   */
  public async getCollectionsTotalWeight(
    reportFromDate: string,
    reportToDate: string,
    country: string
  ): Promise<Map<string, number> | null> {
    try {
      const rawCollectionsWeight = await this.calculateCollectionsTotalWeight(
        reportFromDate,
        reportToDate,
        country
      );

      if (rawCollectionsWeight !== null) {
        let collectionsTotalWeightMap: Map<number, number> =
          this.convertCollectionsUnit(rawCollectionsWeight);

        if (collectionsTotalWeightMap.size != null) {
          return this.convertIdToTitle(collectionsTotalWeightMap);
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
