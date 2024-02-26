import Order from "../Models/Order";
import Product from "../Models/Product";
import OrdersDAO from "../ServiceLayer/OrdersDAO";

/** This class is a blue print of a Map, that contains both a product Id and the total weight of sold products belonging to it  */
class ProductsSoldMap {
  protected soldProductsWeightMap: Map<number, number> = new Map();
  protected ordersDAO: OrdersDAO = OrdersDAO.getInstance();
  constructor() {}

  /** This method initalizes the map and calculates the total product weight sold based on the orders */
  protected async fetchOrders(): Promise<Order[] | null> {
    try {
      /** Gets all orders from shopify through the ordersDAO*/
      //The limit must be changed later
      const orders: Order[] = await this.ordersDAO.getOrdersAfter(
        "2023-01-01 12:00:00.000",
        250
      );

      return orders;
    } catch (e) {
      console.log(`Error calculating ProductsSold Map: ${e.message}`);
      throw new Error(
        `Error fetching products from shopify database: ${e.message}`
      );
    }
  }

  protected calculateSoldProductsWeight(orders: Order[]): void | null {
    try {
      orders.forEach((order: Order) => {
        const orderProducts = order.products;
        orderProducts.forEach((product: Product) => {
          const productTotalWeight = product.totalWeight;

          //Checks if the map has this key already
          if (this.soldProductsWeightMap.has(product.productID)) {
            //If tha map has the key, it re-calculates the total weight, by adding the current (in the loop) product's weight to the total weight in the map
            const accumulatedWeight =
              this.soldProductsWeightMap.get(product.productID) +
              productTotalWeight;
            this.soldProductsWeightMap.set(
              product.productID,
              accumulatedWeight
            );
          } else {
            //If the product doesn't exist already, it sets it as a new product
            this.soldProductsWeightMap.set(
              product.productID,
              productTotalWeight
            );
          }
        });
      });
    } catch (e) {
      console.log(`Error calculating sold products total weight: ${e.message}`);
      throw new Error(
        `Error calculating sold products total weight: ${e.message}`
      );
    }
  }

  public async getSoldProductsWeight(): Promise<Map<number, number> | null> {
    try {
      const orders = await this.fetchOrders();
      this.calculateSoldProductsWeight(orders);
      if (this.soldProductsWeightMap.size !== 0) {
        return this.soldProductsWeightMap;
      }
      return null;
    } catch (e) {
      console.log(`Error getting sold products: ${e.message}`);
      throw new Error(`Error getting sold products total weight: ${e.message}`);
    }
  }
}

export default ProductsSoldMap;
