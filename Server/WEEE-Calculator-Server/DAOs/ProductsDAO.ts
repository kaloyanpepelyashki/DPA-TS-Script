import Product from "../Models/Product";
import ShopifyClient from "../ServiceLayer/ShopifyClient";

/** This class is in charge of retreiving products from the shopify database */
class ProductsDAO extends ShopifyClient {
  public constructor(accesToken: string, hostName: string) {
    super(accesToken, hostName);
  }

  /** This method returns a list of all products that belong to a collection
   * @param collectionId:number
   * @returns {Array<Product>} and array of products belonging to a collection
   */
  public async getProductByCollectionId(
    collectionId: number
  ): Promise<{ isSuccess: boolean; products: any }> {
    try {
      const response = await this.shopify.rest.Product.all({
        session: this.session,
        collection_id: collectionId,
      });

      if (response) {
        return { isSuccess: true, products: response };
      }
      return { isSuccess: false, products: [] };
    } catch (e) {
      console.log(
        `Error getting products from collection ${collectionId}: ${e.message}`
      );

      throw e;
    }
  }

  public async getProductByProductId(
    productId: number
  ): Promise<{ isSuccess: boolean; product: any }> {
    try {
      const response = await this.shopify.rest.Product.find({
        session: this.session,
        id: productId,
      });

      if (response.length > 0) {
        return { isSuccess: true, product: response };
      }

      return { isSuccess: false, product: null };
    } catch (e) {
      console.log(`Error getting product by id ${productId}: ${e.message}`);
      throw e;
    }
  }

  public async getProductVariantByVariantId(variantId: number) {
    try {
      const response = await this.shopify.rest.Variant.find({
        session: this.session,
        id: variantId,
      });

      return response;
    } catch (e) {
      console.log(`Error getting product variant ${variantId}: ${e.message}`);
      throw e;
    }
  }

  /**
   * This method gets all products from the vendor's store based on the status of the prodcut
   * @param status
   * @returns all products from the vendor's store based on the status
   */
  public async getProductsList(
    status?: string
  ): Promise<{ isSuccess: boolean; products: any }> {
    try {
      let allProducts = [];
      let sinceId = 0;

      while (true) {
        const products = await this.shopify.rest.Product.all({
          session: this.session,
          limit: 250,
          since_id: sinceId,
          status: status,
        });
        //The loop breaks when there are no more products fetched.
        if (products.data.length === 0) {
          break;
        }
        allProducts.push(...products.data);
        sinceId = products.data[products.data.length - 1].id; // Updates for next iteration the since_id to the last id from the current iteration
      }

      if (allProducts.length != 0) {
        return { isSuccess: true, products: allProducts };
      }

      return { isSuccess: false, products: [] };
    } catch (e) {
      console.log(`Error getting products from : ${e.message}`);
      throw e;
    }
  }
}

export default ProductsDAO;
