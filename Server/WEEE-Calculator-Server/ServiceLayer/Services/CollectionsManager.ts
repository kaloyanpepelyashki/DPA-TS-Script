import { GraphqlClient, Session, Shopify } from "@shopify/shopify-api";
import ShopifyClient from "../ShopifyClient";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";

export default class CollectionsManager {
  public static instance: CollectionsManager;
  protected collectionsGraphDao: CollectionsGraphDAO;
  protected constructor() {
    this.collectionsGraphDao = CollectionsGraphDAO.getInstance();
  }

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new CollectionsManager();
    }

    return this.instance;
  }

  /**
   * This method creates collections in the vendor's shopify based on a map that is passed as an argument
   * @param {Map<string, string>} collections the key of the map is collection title and the value is the collection description
   */
  //The map should be <title, description>
  public createCollectionsFor(collections: Map<string, string>) {
    try {
      for (let [key, value] of collections) {
        this.collectionsGraphDao.createCollection(key, value);
      }
    } catch (e) {
      throw new Error(e);
    }
  }

  public async getWeeeCollections(
    collectionsNames: Array<string>
  ): Array<number> {
    try {
      let collectionIds = [];
      for (const collectionName of collectionsNames) {
        const collectionId =
          await this.collectionsGraphDao.findCollectionIdByName(collectionName);
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}
