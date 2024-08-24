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
      const result: boolean =
        await this.collectionsManager.addProductsToCollection(
          collectionName,
          products
        );

      return result;
    } catch (e) {
      throw e;
    }
  }

  public async removeProductsFromCollection(
    collectionName: string,
    products: Array<string>
  ): Promise<{ isSuccess: boolean; error?: string }> {
    try {
      const response = await this.collectionsManager.getCollectionIdByName(
        collectionName
      );

      if (!response.isSuccess) {
        throw new ResourceNotFound(
          `Collection ${collectionName} was not found`
        );
      } else {
        const result =
          await this.collectionsManager.removeProductsFromCollection(
            response.payload,
            products
          );

        if (result.isSuccess) {
          return { isSuccess: true };
        }

        return { isSuccess: false, error: result.error };
      }
    } catch (e) {
      return { isSuccess: false, error: e };
    }
  }
}

export default CollectionProductService;
