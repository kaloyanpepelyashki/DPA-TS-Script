import ShopifyClient from "../ShopifyClient";

/** This class is in charge of retreiving products from the shopify database */
class ProductDAO extends ShopifyClient {
  private static instance: ProductDAO;
  private constructor() {
    super();
  }

  public static getInstance(): ProductDAO {
    if (ProductDAO.instance == null) {
      ProductDAO.instance = new ProductDAO();
    }
    return ProductDAO.instance;
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
   *
   * @returns all products from the vendor's store
   */
  public async getProductsList() {
    try {
      let allProducts = [];
      let sinceId = 0;

      while (true) {
        const products = await this.shopify.rest.Product.all({
          session: this.session,
          limit: 250,
          since_id: sinceId,
        });
        //The loop breaks when there are no more products fetched.
        if (products.data.length === 0) {
          break;
        }
        allProducts.push(...products.data);
        sinceId = products.data[products.data.length - 1].id; // Updates for next iteration the since_id to the last id from the current iteration
      }

      return allProducts;
      // const response = await this.shopify.rest.Product.all({
      //   session: this.session,
      // });

      // return response;
    } catch (e) {
      console.log(`Error getting products from : ${e.message}`);
    }
  }
}

export default ProductDAO;
