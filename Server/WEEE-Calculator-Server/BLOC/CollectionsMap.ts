import CollectionsDAO from "../DAOs/CollectionsDAO";
import Product from "../Models/Product";
import CollectionsManager from "../ServiceLayer/Services/CollectionsManager";

/** This class is a blue print of a Map, that contains both a collection Id and the products belonging to it */
class CollectionsMap {
  protected dpaCollectionsMap: Map<number, Array<number>> = new Map();
  protected weeeCollectionIds: Array<number> = [
    608081805635, 608081871171, 608081674563, 608081641795,
  ];
  protected weeeCollectionNames: Array<string>;
  protected collectionsManager: CollectionsManager;
  constructor(
    collectionNames: Array<string>,
    collectionsManager: CollectionsManager
  ) {
    this.weeeCollectionNames = collectionNames;
    this.collectionsManager = collectionsManager;
  }

  protected async initialize(): Promise<void | null> {
    try {
      const collectionIdsResponse: {
        isSuccess: boolean;
        collectionIds: Array<number>;
        error?: string;
      } = await this.collectionsManager.getWeeeCollectionsId(
        this.weeeCollectionNames
      );

      if (collectionIdsResponse.isSuccess) {
        this.weeeCollectionIds = collectionIdsResponse.collectionIds;
        const result = await this.updateCollectionsMap();
        if (result === null) {
          return null;
        }
      }

      throw new Error("Error initialising collections map");
    } catch (e) {
      console.log(`Error initalising collections map: ${e.message}`);
      return null;
    }
  }

  //
  private async updateCollectionsMap(): Promise<void | null> {
    try {
      for (const collectionId of this.weeeCollectionIds) {
        const collectionProducts: {
          isSuccess: boolean;
          products: Array<Product>;
          error?: string;
        } = await this.collectionsManager.getCollectionProducts(collectionId);
        const productsArray: Array<number> = [];

        collectionProducts.products.forEach((product) => {
          productsArray.push(product.id);
        });

        this.dpaCollectionsMap.set(collectionId, productsArray);
      }
    } catch (e) {
      console.log(`Error composing collections map: ${e.message}`);
      throw e;
    }
  }

  /** This method, when called, initises the Map that holds the collections' ids and each product id belonging to this collection, the method then returns the collections map */
  public async getDpaCollectionsMap(): Promise<Map<number, number[]> | null> {
    try {
      await this.initialize();
      return this.dpaCollectionsMap;
    } catch (e) {
      console.log(`Error getting DPA collections: ${e.message}`);
      throw e;
    }
  }
}

export default CollectionsMap;
