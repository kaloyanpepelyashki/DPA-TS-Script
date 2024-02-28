import Product from "./Product";
/** This class represents the order object fetched from the Shopify database*/
class Order {
  public quantity: number;
  public products: Array<Product> = [];
  public productId: number;
  /** @param {Array<Product>} products */
  constructor(products?: Array<Product>) {
    products ? (this.products = products) : (this.products = []);
  }

  /** This method is intended for pushing products to the products array of the Order object
   * @param {Product} product
   */
  public pushProduct(product: Product) {
    this.products.push(product);
  }
}

export default Order;
