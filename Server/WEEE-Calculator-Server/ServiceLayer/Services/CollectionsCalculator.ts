import CollectionsTotalWeightMap from "../../BLOC/CollectionsTotalWeighMap";
import CollectionsDAO from "../../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../../DAOs/CollectionsGraphDAO";
import OrdersDAO from "../../DAOs/OrdersDAO";
import CollectionsManager from "./CollectionsManager";

/**
 * A service class with a signle purpose to calculate the collections total weight and return it
 * The class utilises CollectionsManager, CollectionsTotalWeightMap, OrdersDAO
 */
class CollectionsCalaculator {
  protected collectionsManager: CollectionsManager;
  protected collectionsTotalWeightMap: CollectionsTotalWeightMap;
  protected ordersDao: OrdersDAO;
  constructor(
    ordersDao: OrdersDAO,
    collectionsRestDao: CollectionsDAO,
    collectionsGraphDao: CollectionsGraphDAO
  ) {
    this.collectionsManager = new CollectionsManager(
      collectionsGraphDao,
      collectionsRestDao
    );
    this.ordersDao = ordersDao;
  }

  /**
   * The method, main entry point for initializing the collections total weight calculation process.
   * @param {string} collectionsTitles
   * @returns a map with key collection name and value collection weight
   */
  public async calculateCollectionsTotalWeight(
    collectionsTitles: Array<string>,
    reportFromDate: string,
    reportToDate: string,
    country: string
  ): Promise<Map<string, number>> {
    this.collectionsTotalWeightMap = new CollectionsTotalWeightMap(
      this.collectionsManager,
      this.ordersDao,
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
