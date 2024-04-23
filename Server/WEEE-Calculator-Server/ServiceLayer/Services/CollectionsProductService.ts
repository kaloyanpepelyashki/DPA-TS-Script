import CollectionsDAO from "../../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../../DAOs/CollectionsGraphDAO";
import ResourceNotFound from "../../ExceptionModels/ResourceNotFoundException";
import CollectionsManager from "./CollectionsManager";

class CollectionProductService {
  protected collectionsManager: CollectionsManager;
  constructor(
    collectionGraphDao: CollectionsGraphDAO,
    collectionRestDao: CollectionsDAO
  ) {
    this.collectionsManager = new CollectionsManager(
      collectionGraphDao,
      collectionRestDao
    );
  }

  public async addProductsToCollection(
    collectionName: string,
    products: Array<string>
  ) {
    try {
      const collectionId = await this.collectionsManager.getCollectionIdByName(
        collectionName
      );

      if (!collectionId) {
        throw new ResourceNotFound(
          `Collection ${collectionName} was not found`
        );
      } else {
        const result: boolean =
          await this.collectionsManager.addProductsToCollection(
            collectionId,
            products
          );

        return result;
      }
    } catch (e) {
      throw new Error(e);
    }
  }
}

export default CollectionProductService;
