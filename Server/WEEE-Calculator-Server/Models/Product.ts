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
