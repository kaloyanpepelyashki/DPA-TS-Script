import { GraphqlClient, Session, Shopify } from "@shopify/shopify-api";
import ShopifyClient from "../ShopifyClient";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";
import CollectionsDAO from "../DAOs/CollectionsDAO";

/**
 * This class is an entry point for handling all interactions with the collections object part of the Shopify Admin API
 */
export default class CollectionsManager {
  public static instance: CollectionsManager;
  protected collectionsGraphDao: CollectionsGraphDAO;
  protected collectionsRestDao: CollectionsDAO;
  protected constructor() {
    this.collectionsGraphDao = CollectionsGraphDAO.getInstance();
    this.collectionsRestDao = CollectionsDAO.getInstance();
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
  ): Promise<Array<number>> {
    try {
      let collectionIds: Array<number> = [];
      for (const collectionName of collectionsNames) {
        const colId: string =
          await this.collectionsGraphDao.findCollectionIdByName(collectionName);
        collectionIds.push(Number(colId));
      }

      return collectionIds;
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * This method returns a list of products belonging to a collection
   * @param collectionId
   * @returns
   */
  public async getCollectionProducts(collectionId: number) {
    try {
      const response = await this.collectionsRestDao.getCollectionProducts(
        collectionId
      );

      return response;
    } catch (e) {
      throw new Error(e);
    }
  }

  public async getCollectionNameById(collectionId: number) {
    try {
      const response = await this.collectionsRestDao.findCollectionById(
        collectionId
      );

      if (response) {
        return response.title;
      }
      return null;
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * This method adds an array of products to a collection.
   * @param collectionId
   * @param products
   * @returns
   */
  public async addProductsToCollection(
    collectionId: string,
    products: Array<string>
  ) {
    try {
      const response = await this.collectionsGraphDao.addProductsToCollection(
        collectionId,
        products
      );

      return response;
    } catch (e) {
      throw new Error(
        `Error adding products to collection ${collectionId}: ${e.message}`
      );
    }
  }
}
