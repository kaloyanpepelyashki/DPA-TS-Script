import Product from "./Product";
/** This class represents the product object fetched from the Shopify database
 * productId: number - product's id
 *  productTitle: string - product's title
 *  productVariantId: number - product's variant's id
 *  productWeight: number - product's weight in grams
 *  productQuantity: number - product's quantity
 */
class OrderProduct extends Product {
  public productVariantId: number;
  public productQuantity: number;
  public totalWeight: number;
  constructor(
    productId: number,
    productTitle: string,
    productVariantId: number,
    productWeight: number,
    productQuantity: number
  ) {
    super(productId, productTitle, productWeight);
    this.productVariantId = productVariantId;
    this.productQuantity = productQuantity;
    this.totalWeight = this.productQuantity * this.productWeight;
  }
}

export default OrderProduct;
