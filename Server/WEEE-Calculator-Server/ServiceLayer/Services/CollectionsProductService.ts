import CollectionsDAO from "../../Modules/Collection/DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../../Modules/Collection/DAOs/CollectionsGraphDAO";
import CollectionsManager from "../../Modules/Collection/Services/CollectionsManager";

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
    collectionId: string,
    products: Array<string>
  ): Promise<{ isSuccess: boolean; error?: string }> {
    try {
      const result = await this.collectionsManager.addProductsToCollection(
        collectionId,
        products
      );

      if (result.isSuccess) {
        return { isSuccess: true };
      }

      return result;
    } catch (e) {
      console.error(
        "Error in CollectionsProductService, addProductsToCollection: ",
        e
      );
      return { isSuccess: true, error: e.message };
    }
  }

  public async removeProductsFromCollection(
    collectionId: string,
    products: Array<string>
  ): Promise<{ isSuccess: boolean; error?: string }> {
    try {
      const result = await this.collectionsManager.removeProductsFromCollection(
        collectionId,
        products
      );

      if (result.isSuccess) {
        return { isSuccess: true };
      }

      return { isSuccess: false, error: result.error };
    } catch (e) {
      console.error(
        "Error in CollectionsProductService, removeProductsFromCollection: ",
        e
      );
      return { isSuccess: false, error: e };
    }
  }
}

export default CollectionProductService;
