/** This class is a model of the Product object being fetched from Shopify API */
class Product {
  public id: number;
  public title: string;
  public weight: number;
  public handle: string;
  public imageId: number;
  public imageUrl: string;
  constructor(
    productId: number,
    productTitle: string,
    productWeight: number,
    productHandle?: string,
    productImageId?: number,
    productImageUrl?: string
  ) {
    this.id = productId;
    this.title = productTitle;
    this.weight = productWeight;
    this.handle = productHandle ? productHandle : "";
    this.imageId = productImageId ? productImageId : 0;
    this.imageUrl = productImageUrl ? productImageUrl : "";
  }
}
export default Product;
