/** This class represents the product object fetched from the Shopify database*/
class Product {
    public productID: number;
    public productWeight: number;
    public productVariantId: number;
    public productQuantity: number;
    public totalWeight: number;
    constructor(productId: number, productVariantId: number, productWeight: number, productQuantity: number) {
        this.productID = productId;
        this.productVariantId = productVariantId;
        this.productWeight = productWeight;
        this.productQuantity = productQuantity;
        this.totalWeight = this.productQuantity * this.productWeight;
    }
}

export default Product