import Product from "../../Models/Product";
import ProductsDAO from "../../DAOs/ProductsDAO";
class ProductsManager {
  private productsDao: ProductsDAO;
  public constructor(productsDao: ProductsDAO) {
    this.productsDao = productsDao;
  }

  /**
   * This method queries the Shopify REST API and returns all active products in the vendors's store
   * @returns {Array<Product>} An array of all active products
   */
  public async getAllActiveProducts(): Promise<{
    isSuccess: boolean;
    products: Array<Product>;
    error?: string;
  }> {
    try {
      const result: { isSuccess: boolean; products: any } =
        await this.productsDao.getProductsList("active");

      if (result.isSuccess) {
        let productList: Array<Product> = result.products.map((productItem) => {
          console.log("product images[]", productItem.images);
          return new Product(
            productItem.id,
            productItem.title,
            productItem.variants[0].grams,
            productItem.handle,
            productItem.images.length > 0 ? productItem.images[0].id : 0,
            productItem.images.length > 0 ? productItem.images[0].src : ""
          );
        });
        return { isSuccess: true, products: productList };
      } else {
        return { isSuccess: false, products: [] };
      }
    } catch (e) {
      console.log(e);
      return { isSuccess: false, products: [], error: e.message };
    }
  }

  /**
   * This method queries the Shopify REST API and gets the product requested by product id
   * @param {number} productId
   * @returns { isSuccess: boolean; product: any; error?: string }
   */
  public async getProductByProductId(
    productId: number
  ): Promise<{ isSuccess: boolean; product: any; error?: string }> {
    try {
      const result = await this.productsDao.getProductByProductId(productId);

      if (result.isSuccess) {
        return { isSuccess: true, product: result.product };
      }

      return {
        isSuccess: false,
        product: null,
        error: "Product was not found",
      };
    } catch (e) {
      console.log("Error in ProductsManager. Error getting product by id: ", e);
      return { isSuccess: false, product: null, error: e.message };
    }
  }

  /** This method queries the Shopify REST API and gets a list of produduct, belonging to a collection
   * The method requires a collection id of the collection which products are to be fetched
   * @param {number} collectionId
   * @returns { isSuccess: boolean; products: Array<Product>; error?: string } Success status, an array of all products belonging to the collection and an error mmessage if any
   */
  public async getProductsForCollection(
    collectionId: number
  ): Promise<{ isSuccess: boolean; products: Array<Product>; error?: string }> {
    try {
      //Here the DAO calls the Shopify API and initialises the fetch;
      const response: { isSuccess: boolean; products: any } =
        await this.productsDao.getProductByCollectionId(collectionId);

      if (response.isSuccess) {
        const productsList: Array<Product> = response.products.map(
          (product) =>
            new Product(
              product.id,
              product.title,
              product.variants[0].grams,
              product.handle,
              product.images.length > 0 ? product.images[0].id : 0,
              product.images.length > 0 ? product.images[0].src : ""
            )
        );
        return { isSuccess: true, products: productsList };
      } else {
        return {
          isSuccess: false,
          products: [],
          error: `No products were found for collection: ${collectionId}`,
        };
      }
    } catch (e) {
      console.log(e);
      return { isSuccess: false, products: [], error: e.message };
    }
  }
}
export default ProductsManager;
