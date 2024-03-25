import OrderProduct from "./OrderProduct";
/** This class represents the order object fetched from the Shopify database*/
class Order {
  public quantity: number;
  public products: Array<OrderProduct> = [];
  public productId: number;
  /** @param {Array<Product>} products */
  constructor(products?: Array<OrderProduct>) {
    products ? (this.products = products) : (this.products = []);
  }

  /** This method is intended for pushing products to the products array of the Order object
   * @param {Product} product
   */
  public pushProduct(product: OrderProduct) {
    this.products.push(product);
  }
}

export default Order;
