import { GraphqlClient, Session, Shopify } from "@shopify/shopify-api";
import ShopifyClient from "../ShopifyClient";
import CollectionsGraphDAO from "../../DAOs/CollectionsGraphDAO";
import CollectionsDAO from "../../DAOs/CollectionsDAO";
import Collection from "../../Models/Collection";
import Product from "../../Models/Product";
import ResourceNotFound from "../../ExceptionModels/ResourceNotFoundException";
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
      console.error(
        "Error in CollectionsManager. Error getting WEEE collections: ",
        e
      );
      return { isSuccess: false, products: null, error: e.message };
    }
  }
  /**
   * This method returns only the collections containing "WEEE" in their title
   * The method will return null if no collections containing "WEEE" in their title were found
   * @returns {Array<Collection>} All WEEE collections in vendor's store
   */
  public async getWeeeCollections(): Promise<{
    isSuccess: boolean;
    collections: Array<Collection>;
    error?: string;
  }> {
    try {
      const collectionsUnFiltered: Array<Collection> =
        await this.collectionsGraphDao.getAllCollections();

      if (collectionsUnFiltered != null) {
        const collectionsFiltered: Array<Collection> =
          collectionsUnFiltered.filter((collection) =>
            collection.title.includes("WEEE")
          );

        if (collectionsFiltered.length > 0) {
          return { isSuccess: true, collections: collectionsFiltered };
        } else {
          return { isSuccess: true, collections: [] };
        }
      }

      return {
        isSuccess: true,
        collections: [],
      };
    } catch (e) {
      console.error(
        "Error in CollectionsManager. Error getting WEEE collections: ",
        e
      );
      return { isSuccess: false, collections: [], error: e.message };
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
      throw e;
    }
  }

  public async getCollectionIdByName(
    collectionName: string
  ): Promise<{ isSuccess: boolean; payload: string; error?: string }> {
    try {
      const response: string | null =
        await this.collectionsGraphDao.findCollectionIdByName(collectionName);

      if (response != null) {
        return { isSuccess: true, payload: response };
      }

      throw new ResourceNotFound(
        `Could not get id for collection: ${collectionName}`
      );
    } catch (e) {
      console.error(
        "Error in CollectionsManager. Error getting collection id",
        e
      );
      return { isSuccess: false, payload: null, error: e.message };
    }
  }

  /**
   * This method adds an array of products to a collection.
   * @param collectionId the target collection products will be added to
   * @param products the array of product ids that are to be added
   * @returns { isSuccess: boolean; error?: string } the isSuccess represents whether the action executed successfully or not, the error message represents an error message if any
   */
  public async addProductsToCollection(
    collectionId: string,
    products: Array<string>
  ): Promise<{ isSuccess: boolean; error?: string }> {
    try {
      const response = await this.collectionsGraphDao.addProductsToCollection(
        collectionId,
        products
      );

      if (response.isSuccess) {
        return { isSuccess: true };
      }

      return { isSuccess: false, error: "Error adding products to collection" };
    } catch (e) {
      console.error("Error in CollectionsManager addProductsToCollection: ", e);
      return { isSuccess: false, error: e.message };
    }
  }

  /**
   * This method removes an array of products from a collection
   * @param collectionId the target collection products will be removed from
   * @param products the array of product ids that are to be removed
   * @returns { isSuccess: boolean; error?: string } the isSuccess represents whether the action executed successfully or not, the error message represents an error message if any
   */
  public async removeProductsFromCollection(
    collectionId: string,
    products: Array<string>
  ): Promise<{ isSuccess: boolean; error?: string }> {
    try {
      const response =
        await this.collectionsGraphDao.removeProductsFromCollection(
          collectionId,
          products
        );

      if (response.isSuccess) {
        return { isSuccess: true };
      }

      return {
        isSuccess: false,
        error: "Error removing products from a collection",
      };
    } catch (e) {
      console.error(
        "Error in CollectionsManager removeProductsFromCollection: ",
        e
      );
      return { isSuccess: false, error: e.message };
    }
  }
}

export default CollectionsManager;
