import CollectionsDAO from "../ServiceLayer/CollectionsDAO";

/** This class is a blue print of a Map, that contains both a collection Id and the products belonging to it */
class CollectionsMap {
  protected dpaCollectionsMap: Map<number, Array<number>> = new Map();
  protected dpaCollectionIds: Array<number> = [
    608081805635, 608081871171, 608081674563, 608081641795,
  ];
  protected collectionsDAO: CollectionsDAO = CollectionsDAO.getInstance();
  constructor() {}

  public async initialize(): Promise<void | null> {
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
