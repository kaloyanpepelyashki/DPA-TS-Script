import { GraphqlClient, Session, Shopify } from "@shopify/shopify-api";
import ShopifyClient from "../ShopifyClient";
import CollectionsGraphDAO from "../../DAOs/CollectionsGraphDAO";
import CollectionsDAO from "../../DAOs/CollectionsDAO";
import Collection from "../../Models/Collection";
import Product from "../../Models/Product";
class CollectionsManager {
  protected collectionsGraphDao: CollectionsGraphDAO;
  protected collectionsRestDao: CollectionsDAO;
  public constructor(
    collectionsGraphDao: CollectionsGraphDAO,
    collectionsRestDao: CollectionsDAO
  ) {
    this.collectionsGraphDao = collectionsGraphDao;
    this.collectionsRestDao = collectionsRestDao;
  }

  /**
   * This method creates collections in the vendor's shopify based on a map that is passed as an argument
   * @param {Map<string, string>} collections the key of the map is collection title and the value is the collection description
   */
  //The map should be <title, description>
  public async createCollectionsFor(
    collections: Array<Map<string, string>>
  ): Promise<{ isSuccess: boolean; error?: string }> {
    try {
      //Iterates over the array of maps
      for (let i = 0; i < collections.length; i++) {
        //Iterates over a map, part of the array of maps
        for (let [key, value] of collections[i]) {
          let result = await this.collectionsGraphDao.createCollection(
            key,
            value
          );

          if (!result.isSuccess) {
            throw new Error(result.error);
          }
        }
      }
      return { isSuccess: true };
    } catch (e) {
      return { isSuccess: false, error: e.message };
    }
  }

  public async getWeeeCollectionsId(collectionsNames: Array<string>): Promise<{
    isSuccess: boolean;
    collectionIds: Array<number>;
    error?: string;
  }> {
    try {
      let collectionIds: Array<number> = [];
      for (const collectionName of collectionsNames) {
        const colId: string =
          await this.collectionsGraphDao.findCollectionIdByName(collectionName);
        collectionIds.push(Number(colId));
      }

      return { isSuccess: true, collectionIds: collectionIds };
    } catch (e) {
      return { isSuccess: false, collectionIds: null, error: e.message };
    }
  }

  /**
   * This method returns a list of all products belonging to a collection
   * @param collectionId
   * @returns { isSuccess: boolean; products: Array<Product>; error?: string }
   */
  public async getCollectionProducts(
    collectionId: number
  ): Promise<{ isSuccess: boolean; products: Array<Product>; error?: string }> {
    try {
      const response = await this.collectionsRestDao.getCollectionProducts(
        collectionId
      );
      if (response.isSuccess) {
        return { isSuccess: true, products: response.products };
      }

      return { isSuccess: false, products: [] };
    } catch (e) {
      return { isSuccess: false, products: null, error: e.message };
    }
  }
  /**
   * This method returns only the collections containing "WEEE" in their title
   * The method will return null if no collections containing "WEEE" in their title were found
   * @returns {Array<Collection>} All WEEE collections in vendor's store
   */
  public async getWeeeCollections(): Promise<Array<Collection>> {
    try {
      const collectionsUnFiltered: Array<Collection> =
        await this.collectionsGraphDao.getAllCollections();
      console.log("collections un filtered: ", collectionsUnFiltered);
      if (collectionsUnFiltered != null) {
        const collectionsFiltered: Array<Collection> =
          collectionsUnFiltered.filter((collection) =>
            collection.title.includes("WEEE")
          );

        if (collectionsFiltered.length > 0) {
          return collectionsFiltered;
        } else {
          return null;
        }
      }

      return null;
    } catch (e) {
      throw e;
    }
  }

  public async getCollectionNameById(collectionId: number): Promise<string> {
    try {
      const response = await this.collectionsRestDao.findCollectionById(
        collectionId
      );
      if (response) {
        const title: string = response.title;
        return title;
      }
      return null;
    } catch (e) {
      throw new Error(e);
    }
  }

  public async getCollectionIdByName(collectionName: string) {
    try {
      const response: string | null =
        await this.collectionsGraphDao.findCollectionIdByName(collectionName);

      return response;
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

export default CollectionsManager;
