import CollectionsDAO from "../ServiceLayer/DAOs/CollectionsDAO";

/** This class is a blue print of a Map, that contains both a collection Id and the products belonging to it */
class CollectionsMap {
  protected dpaCollectionsMap: Map<number, Array<number>> = new Map();
  protected dpaCollectionIds: Array<number> = [
    608081805635, 608081871171, 608081674563, 608081641795,
  ];
  protected collectionsDAO: CollectionsDAO = CollectionsDAO.getInstance();
  constructor() {}

  protected async initialize(): Promise<void | null> {
    try {
      const result = await this.updateCollectionsMap();
      if (result === null) {
        return null;
      }
    } catch (e) {
      console.log(`Error initalising collections map: ${e.message}`);
      return null;
    }
  }

  private async updateCollectionsMap(): Promise<void | null> {
    try {
      for (const collectionId of this.dpaCollectionIds) {
        const collectionProducts =
          await this.collectionsDAO.getCollectionProducts(collectionId);
        const productsArray: Array<number> = [];

        collectionProducts.products.forEach((product) => {
          productsArray.push(product.id);
        });

        this.dpaCollectionsMap.set(collectionId, productsArray);
      }
    } catch (e) {
      console.log(`Error composing collections map: ${e.message}`);
      return null;
    }
  }

  /** This method, when called, initises the Map that holds the collections' ids and each product id belonging to this collection, the method then returns the collections map */
  public async getDpaCollectionsMap(): Promise<Map<number, number[]> | null> {
    try {
      await this.initialize();
      return this.dpaCollectionsMap;
    } catch (e) {
      console.log(`Error getting DPA collections: ${e.message}`);
      return null;
    }
  }
}

export default CollectionsMap;
