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
  ): Promise<Map<string, number>> {
    this.collectionsTotalWeightMap = new CollectionsTotalWeightMap(
      this.collectionsManager,
      this.ordersManager,
      collectionsTitles
    );

    return await this.collectionsTotalWeightMap.getCollectionsTotalWeight(
      reportFromDate,
      reportToDate,
      country
    );
  }
}

export default CollectionsCalaculator;
