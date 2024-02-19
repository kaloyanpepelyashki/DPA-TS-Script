/** This class represents the product object fetched from the Shopify database*/
class Product {
    public productID: number;
    constructor(product) {
        this.productID = product.product_id;
    }
}

export default Product