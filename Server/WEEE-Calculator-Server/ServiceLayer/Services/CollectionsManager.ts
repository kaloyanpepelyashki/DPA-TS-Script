import { GraphqlClient, Session, Shopify } from "@shopify/shopify-api";
import ShopifyClient from "../ShopifyClient";
import CollectionsGraphDAO from "../../DAOs/CollectionsGraphDAO";
import CollectionsDAO from "../../DAOs/CollectionsDAO";
import Collection from "../../Models/Collection";
//TODO Change the structure of the class, it needs to pass down the class tree accessToken and host
/**
 * This class is an entry point for handling all interactions with the collections object part of the Shopify Admin API
 * The class constructor expects parameters collectionsGraphDao and collectionsRestDao
 */
// class CollectionsManager {
//   public static instance: CollectionsManager;
//   protected collectionsGraphDao: CollectionsGraphDAO;
//   protected collectionsRestDao: CollectionsDAO;
//   protected constructor() {
//     this.collectionsGraphDao = CollectionsGraphDAO.getInstance();
//     this.collectionsRestDao = CollectionsDAO.getInstance();
//   }

//   public static getInstance() {
//     if (this.instance == null) {
//       this.instance = new CollectionsManager();
//     }

//     return this.instance;
//   }

//   /**
//    * This method creates collections in the vendor's shopify based on a map that is passed as an argument
//    * @param {Map<string, string>} collections the key of the map is collection title and the value is the collection description
//    */
//   //The map should be <title, description>
//   public createCollectionsFor(collections: Map<string, string>): boolean {
//     try {
//       for (let [key, value] of collections) {
//         this.collectionsGraphDao.createCollection(key, value);
//       }
//       return true;
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   public async getWeeeCollectionsId(
//     collectionsNames: Array<string>
//   ): Promise<Array<number>> {
//     try {
//       let collectionIds: Array<number> = [];
//       for (const collectionName of collectionsNames) {
//         const colId: string =
//           await this.collectionsGraphDao.findCollectionIdByName(collectionName);
//         collectionIds.push(Number(colId));
//       }

//       return collectionIds;
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   /**
//    * This method returns a list of products belonging to a collection
//    * @param collectionId
//    * @returns
//    */
//   public async getCollectionProducts(collectionId: number) {
//     try {
//       const response = await this.collectionsRestDao.getCollectionProducts(
//         collectionId
//       );

//       return response;
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   public async getCollectionNameById(collectionId: number): Promise<string> {
//     try {
//       const response = await this.collectionsRestDao.findCollectionById(
//         collectionId
//       );
//       if (response) {
//         const title: string = response.title;
//         return title;
//       }
//       return null;
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   public async getCollectionIdByName(collectionName: string) {
//     try {
//       const response: string | null =
//         await this.collectionsGraphDao.findCollectionIdByName(collectionName);

//       return response;
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   /**
//    * This method adds an array of products to a collection.
//    * @param collectionId
//    * @param products
//    * @returns
//    */
//   public async addProductsToCollection(
//     collectionId: string,
//     products: Array<string>
//   ) {
//     try {
//       const response = await this.collectionsGraphDao.addProductsToCollection(
//         collectionId,
//         products
//       );

//       return response;
//     } catch (e) {
//       throw new Error(
//         `Error adding products to collection ${collectionId}: ${e.message}`
//       );
//     }
//   }
// }

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
  ): Promise<boolean> {
    try {
      //Iterates over the array of maps
      for (let i = 0; i < collections.length; i++) {
        //Iterates over a map, part of the array of maps
        for (let [key, value] of collections[i]) {
          await this.collectionsGraphDao.createCollection(key, value);
        }
      }
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }

  public async getWeeeCollectionsId(
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
  /**
   * This method returns only the collections containing "WEEE" in their title
   * The method will return null if no collections containing "WEEE" in their title were found
   * @returns Array<Collection>
   */
  public async getWeeeCollections(): Promise<Array<Collection>> {
    try {
      const collectionsUnFiltered: Array<Collection> =
        await this.collectionsGraphDao.getAllCollections();
      const collectionsFiltered: Array<Collection> =
        collectionsUnFiltered.filter((collection) =>
          collection.title.includes("WEEE")
        );

      if (collectionsFiltered.length > 0) {
        return collectionsFiltered;
      } else {
        return null;
      }
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
