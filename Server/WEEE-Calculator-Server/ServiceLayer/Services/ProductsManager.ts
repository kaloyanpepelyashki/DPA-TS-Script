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
  public async getAllActiveProducts(): Promise<Array<Product>> {
    try {
      const result = await this.productsDao.getProductsList("active");

      if (result) {
        let productList: Array<Product> = result.map((productItem) => {
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
        return productList;
      } else {
        return null;
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * This method queries the Shopify REST API and gets the product requested by product id
   * @param {number} productId
   * @returns
   */
  public async getProductByProductId(productId: number) {
    try {
      const result = await this.productsDao.getProductByProductId(productId);

      return result;
    } catch (e) {
      throw e;
    }
  }

  /** This method queries the Shopify REST API and gets a list of produduct, belonging to a collection
   * The method requires a collection id of the collection which products are to be fetched
   * @param {number} collectionId
   * @returns {Array<Product>} An array of all products belonging to the collection
   */
  public async getProductsForCollection(
    collectionId: number
  ): Promise<Array<Product>> {
    try {
      const response = await this.productsDao.getProductByCollectionId(
        collectionId
      );

      if (response) {
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
        return productsList;
      } else {
        return null;
      }
    } catch (e) {
      throw e;
    }
  }
}
export default ProductsManager;
