import Product from "./Product";
/** This class represents the order object fetched from the Shopify database*/
class Order {
  public quantity: number;
  public products: Array<Product> = [];
  public productId: number;
  constructor(products?: Array<Product>) {
    products ? (this.products = products) : (this.products = []);
  }

  public pushProduct(product: Product) {
    this.products.push(product);
  }
}

export default Order;
