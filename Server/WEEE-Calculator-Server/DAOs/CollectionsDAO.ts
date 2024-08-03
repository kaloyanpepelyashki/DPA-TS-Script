import ShopifyClient from "../ServiceLayer/ShopifyClient";

//TODO Change the structure of the class, so it can take in an accessToken and a host to be passed down to the ShopifyClient class
/**This data access class is in charge of getting the collections object from the Shopify Database  */
class CollectionsDAO extends ShopifyClient {
  public constructor(accessToken: string, hostName: string) {
    super(accessToken, hostName);
  }

  public async findCollectionById(collectionId: number) {
    try {
      const response = await this.shopify.rest.Collection.find({
        session: this.session,
        id: collectionId,
      });

      return response;
    } catch (e) {
      console.log(`Error finding collection: ${e.message}`);
    }
  }

  /** This method returns all products for a collection based on collection Id
   * @param {number} collectionId
   */
  public async getCollectionProducts(
    collectionId: number
  ): Promise<{ isSuccess: boolean; products: any }> {
    try {
      const response = await this.shopify.rest.Collection.products({
        session: this.session,
        id: collectionId,
      });

      return { isSuccess: true, products: response.products };
    } catch (e) {
      console.log(
        `Error getting products from collection ${collectionId}: ${e.message}`
      );

      throw e;
    }
  }

  public async getSmartCollectionOnProductId(productId: number) {
    try {
      const response = this.shopify.rest.SmartCollection.all({
        session: this.session,
        product_id: productId,
      });

      return response;
    } catch (e) {
      console.log(
        `Error getting smart collection by product Id ${productId}: ${e.message}`
      );
      return null;
    }
  }
}

export default CollectionsDAO;
