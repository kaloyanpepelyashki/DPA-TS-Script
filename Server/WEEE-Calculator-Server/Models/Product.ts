/** This class is a model of the Product object being fetched from Shopify API */
class Product {
  public productId: number;
  public productTitle: string;
  public productWeight: number;
  public productHandle: string;
  public productImageId: number;
  public productImageUrl: string;
  constructor(
    productId: number,
    productTitle: string,
    productWeight: number,
    productHandle?: string,
    productImageId?: number,
    productImageUrl?: string
  ) {
    this.productId = productId;
    this.productTitle = productTitle;
    this.productWeight = productWeight;
    this.productHandle = productHandle ? productHandle : "";
    this.productImageId = productImageId ? productImageId : 0;
    this.productImageUrl = productImageUrl ? productImageUrl : "";
  }
}
export default Product;
