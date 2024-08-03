import ShopifyClient from "../ServiceLayer/ShopifyClient";
import Order from "../Models/Order";
import OrderProduct from "../Models/OrderProduct";
import ProductsManager from "../ServiceLayer/Services/ProductsManager";

/** A class that is in charge of getting the orders objects from the Shopify database
 * The class extends the ShopifyClient client class and thus has access to all members part of the ShopifyClient class
 */
class OrdersDAO extends ShopifyClient {
  public constructor(accessToken: string, hostName: string) {
    super(accessToken, hostName);
  }

  /** This method returns the whole orders object
   * @param {string} date: string (ISO 8601)
   * @param {nummber} limit(the limit of products shown)
   */
  public async getOrdersOBJAfter(date: string, limit?: number) {
    try {
      const response = await this.shopify.rest.Order.all({
        session: this.session,
        status: "closed",
        created_at_min: date,
        limit: limit,
      });

      return response;
    } catch (e) {
      console.log(`Error retreiving orders: ${e}`);
      return null;
    }
  }
  /** This method returns an array of OrderProduct objects, containing an array of objects, representing each order's product that fit the condition of being ordered after the specific date
   * @param {string} fromDate  (ISO 8601 format)
   * @param {string} toDate (ISO 8601 format)
   */
  public async getOrdersBetween(
    fromDate: string,
    toDate: string,
    country: string
  ): Promise<{ isSuccess: boolean; orders: Array<Order> | null }> {
    try {
      const response: {
        isSuccess: boolean;
        allOrders: any[] | null;
      } = await this.fetchAllOrdersBetween(fromDate, toDate);

      if (!response.isSuccess) {
        return { isSuccess: false, orders: null };
      }

      if (response.isSuccess && response.allOrders.length > 0) {
        let ordersArray: Array<Order> = [];
        response.allOrders.forEach((order) => {
          if (order.billing_address.country === country) {
            const orderItem = new Order();
            order.line_items.forEach((lineItem) => {
              const product = new OrderProduct(
                lineItem.product_id,
                lineItem.title,
                lineItem.variant_id,
                lineItem.grams,
                lineItem.quantity
              );
              orderItem.pushProduct(product);
            });
            ordersArray.push(orderItem);
          } else {
            return;
          }
        });

        return { isSuccess: true, orders: ordersArray };
      }

      return { isSuccess: false, orders: null };
    } catch (e) {
      console.log(`Error retreiving products: ${e}`);
      throw e;
    }
  }

  /** This method fetches all orders for the specified period */
  protected async fetchAllOrdersBetween(
    fromDate: string,
    toDate: string
  ): Promise<{ isSuccess: boolean; allOrders: any[] | null }> {
    try {
      let allOrders = [];
      let sinceId = 0;

      while (true) {
        const orders = await this.shopify.rest.Order.all({
          session: this.session,
          limit: 250,
          status: "closed",
          created_at_min: fromDate,
          created_at_max: toDate,
          since_id: sinceId,
        });
        //The loop breaks when there are no more orders fetched (the orders are over for the period).
        if (orders.data.length === 0) {
          break;
        }
        allOrders.push(...orders.data);
        sinceId = orders.data[orders.data.length - 1].id; // Updates for next iteration the since_id to the last id from the current iteration
      }

      if (allOrders.length > 0) {
        return { isSuccess: true, allOrders: allOrders };
      }

      return { isSuccess: false, allOrders: null };
    } catch (e) {
      console.log(`Error getting more than 250 products: ${e.message}`);
      throw e;
    }
  }

  public async getOrdersCountFor(
    fromDate: string,
    toDate: string,
    country: string
  ): Promise<{ isSuccess: boolean; count: number }> {
    try {
      const response = await this.shopify.rest.Order.count({
        session: this.session,
        status: "any",
        created_at_min: fromDate,
        created_at_max: toDate,
      });

      if (response.status == 200) {
        return { isSuccess: true, count: response.count };
      }
      return { isSuccess: false, count: null };
    } catch (e) {
      console.log("Error getting orders count");
      throw e;
    }
  }
}

export default OrdersDAO;
