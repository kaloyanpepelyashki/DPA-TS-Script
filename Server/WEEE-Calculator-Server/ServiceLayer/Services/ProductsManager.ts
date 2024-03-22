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
        console.log(typeof result);
        return result;
      } else {
        return null;
      }
    } catch (e) {
      throw new Error("Error getting all products: ${e}");
    }
  }
}
export default ProductsManager;
