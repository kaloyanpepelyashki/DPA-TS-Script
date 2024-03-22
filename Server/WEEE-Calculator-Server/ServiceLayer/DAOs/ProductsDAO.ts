import ShopifyClient from "../ShopifyClient";

/** This class is in charge of retreiving products from the shopify database */
class ProductsDAO extends ShopifyClient {
  private static instance: ProductsDAO;
  private constructor() {
    super();
  }

  public static getInstance(): ProductsDAO {
    if (ProductsDAO.instance == null) {
      ProductsDAO.instance = new ProductsDAO();
    }
    return ProductsDAO.instance;
  }

  /** This method returns the products that belong to a collectio
   * @param collectionId:number
   */
  public async getProductByCollectionId(collectionId: number) {
    try {
      const response = await this.shopify.rest.Product.all({
        session: this.session,
        collection_id: collectionId,
      });

      return response;
    } catch (e) {
      console.log(
        `Error getting products from session ${collectionId}: ${e.message}`
      );
    }
  }

  public async getProductByProductId(productId: number) {
    try {
      const response = await this.shopify.rest.Product.find({
        session: this.session,
        id: productId,
      });

      return response;
    } catch (e) {
      console.log(`Error getting product by id ${productId}: ${e.message}`);
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
    }
  }

  /**
   * This method gets all products from the vendor's store based on the status of the prodcut
   * @param status
   * @returns all products from the vendor's store based on the status
   */
  public async getProductsList(status?: string) {
    //TODO Consider using the GraphQL API for getting the products as it fetches less data
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

      return allProducts;
    } catch (e) {
      console.log(`Error getting products from : ${e.message}`);
    }
  }
}

export default ProductsDAO;
