/** This class is a model of the Product object being fetched from Shopify API */
class Product {
  public productId: number;
  public productTitle: string;
  public productWeight: number;
  constructor(productId: number, productTitle: string, productWeight: number) {
    this.productId = productId;
    this.productTitle = productTitle;
    this.productWeight = productWeight;
  }
}
export default Product;
