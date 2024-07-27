import OrdersDAO from "../../DAOs/OrdersDAO";
import OrdersGraphDAO from "../../DAOs/OrdersGraphDAO";
import Order from "../../Models/Order";

//TODO Add the methods from both of the DAOs to the manager
class OrdersManager {
  private ordersDao: OrdersDAO;
  private ordersGraphDao: OrdersGraphDAO;
  public constructor(ordersDao: OrdersDAO, orderGraphDao: OrdersGraphDAO) {
    this.ordersDao = ordersDao;
    this.ordersGraphDao = orderGraphDao;
  }

  //TODO This method needs to filter out the orders based on country of origin as well.
  public async fetchAllOrdersFor(
    fromDate: string,
    toDate: string,
    country: string
  ): Promise<{ isSuccess: boolean; orders: Array<Order> }> {
    const response: Array<Order> | null = await this.ordersDao.getOrdersBetween(
      fromDate,
      toDate,
      country
    );

    if (response != null) {
      return { isSuccess: true, orders: response };
    }

    return { isSuccess: false, orders: null };
  }
  public async getShopOrdersCountFor(
    fromDate: string,
    toDate: string,
    country: string
  ): Promise<{ isSuccess: boolean; count: number }> {
    try {
      const response = await this.ordersGraphDao.getOrdersCountFor(
        fromDate,
        toDate,
        country
      );

      if (response.isSuccess) {
        return { isSuccess: true, count: response.count };
      }

      return { isSuccess: false, count: 0 };
    } catch (e) {
      throw e;
    }
  }
}

export default OrdersManager;
