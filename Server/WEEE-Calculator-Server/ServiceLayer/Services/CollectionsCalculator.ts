import CollectionsTotalWeightMap from "../../BLOC/CollectionsTotalWeighMap";
import CollectionsDAO from "../../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../../DAOs/CollectionsGraphDAO";
import OrdersDAO from "../../DAOs/OrdersDAO";
import CollectionsManager from "./CollectionsManager";
import OrdersManager from "./OrdersManager";

/**
 * A service class with a signle purpose to calculate the collections total weight and return it
 * The class utilises CollectionsManager, CollectionsTotalWeightMap, OrdersDAO
 * The class constructor takes in OrdersDAO, CollectionsDAO, CollectionsGraphDAO
 */
class CollectionsCalaculator {
  protected collectionsManager: CollectionsManager;
  protected collectionsTotalWeightMap: CollectionsTotalWeightMap;
  protected ordersManager: OrdersManager;
  constructor(
    ordersManager: OrdersManager,
    collectionsRestDao: CollectionsDAO,
    collectionsGraphDao: CollectionsGraphDAO
  ) {
    this.collectionsManager = new CollectionsManager(
      collectionsGraphDao,
      collectionsRestDao
    );
    this.ordersManager = ordersManager;
  }

  /**
   * The method, main entry point for initializing the collections total weight calculation process.
   * @param {string} collectionsTitles
   * @returns a map where the key is collection title and value is collection weight in kilograms
   */
  public async calculateCollectionsTotalWeight(
    collectionsTitles: Array<string>,
    reportFromDate: string,
    reportToDate: string,
    country: string
  ): Promise<{
    isSuccess: boolean;
    collectionsTotalWeights: Map<string, number>;
    error?: string;
  }> {
    try {
      this.collectionsTotalWeightMap = new CollectionsTotalWeightMap(
        this.collectionsManager,
        this.ordersManager,
        collectionsTitles
      );

      const collectionsTotalWeights =
        await this.collectionsTotalWeightMap.getCollectionsTotalWeight(
          reportFromDate,
          reportToDate,
          country
        );

      if (collectionsTotalWeights.isSuccess) {
        return {
          isSuccess: true,
          collectionsTotalWeights:
            collectionsTotalWeights.collectionsTotalWeights,
        };
      }

      return {
        isSuccess: true,
        collectionsTotalWeights: null,
        error: "Could not get collections total weights",
      };
    } catch (e) {
      console.log("Error calculating collections total weight: ", e);
      return {
        isSuccess: false,
        collectionsTotalWeights: null,
        error: e.message,
      };
    }
  }
}

export default CollectionsCalaculator;
