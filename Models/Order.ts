import Product from "./Product";
/** This class represents the order object fetched from the Shopify database*/
class Order {
    public quantity: number;
    public product: Product;
    public productId: number;
    constructor(object) {
        this.quantity = object.quantity;
        this.product = new Product(object);
        this.productId = this.product.productID;
    }
}

export default Order;