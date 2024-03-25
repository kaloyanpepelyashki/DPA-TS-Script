import Product from "../../Models/Product";
import ProductsDAO from "../DAOs/ProductsDAO";

class ProductsManager {
  protected static instance: ProductsManager;
  private productsDao: ProductsDAO;
  private constructor() {
    this.productsDao = ProductsDAO.getInstance();
  }

  public static getInstance(): ProductsManager {
    if (!this.instance) {
      this.instance = new ProductsManager();
    }

    return this.instance;
  }

  public async getAllActiveProducts() {
    try {
      const result = await this.productsDao.getProductsList("active");

      if (result) {
        let productList: Array<Product> = [];
        result.forEach((productItem) => {
          const product = new Product(
            productItem.id,
            productItem.title,
            productItem.variants[0].grams
          );
          productList.push(product);
        });
        return productList;
      } else {
        return null;
      }
    } catch (e) {
      throw new Error("Error getting all products: ${e}");
    }
  }

  public async getProductByProductId(productId: number) {
    try {
      const result = await this.productsDao.getProductByProductId(productId);

      return result;
    } catch (e) {
      throw new Error(`${e}`);
    }
  }
}
export default ProductsManager;
