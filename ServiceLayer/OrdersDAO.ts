import ShopifyClient from "./ShopifyClient";
import Order from "../Models/Order";
import Product from "../Models/Product";
import ProductDAO from "./ProductDAO";

/** A class that is in charge of getting the orders objects from the Shopify database
 * The class extends the ShopifyClient client class and thus has access to all members part of the ShopifyClient class
 */ 
class OrdersDAO extends ShopifyClient {
    private static instance: OrdersDAO;
    private constructor() {
        super();
    }

    public static getInstance(): OrdersDAO {
        if(OrdersDAO.instance == null) {
            OrdersDAO.instance = new OrdersDAO();
        }
        return OrdersDAO.instance;
    }


    /** This method returns the whole orders object
     * @param {string} date: string (ISO 8601)
     * @param limmit: number (the limit of products shown)
     */
    public async getOrdersOBJAfter(date: string, limit?: number) {
        try{
            const response = await this.shopify.rest.Order.all({
                session: this.session,
                status: "closed",
                created_at_min: date,
                limit: limit
            })

            return response;
        } catch(e) {
            console.log(`Error retreiving orders: ${e}`)
        }
    }
    /** This method returns an array of product's ID's that fit the condition of being ordered after the specific date
     * @param {string} date  (ISO 8601)
     * @param limmit number (the limit of products shown)
     */
    public async getOrdersProductIDAfter(date: string, limit?: number) {
        try{
            const response = await this.getOrdersOBJAfter(date, limit);

            if(response.data.length > 0) {
                let ordersArray: Array<Order> = [];
                response.data.forEach((order) => {
                    const orderItem = new Order();
                    order.line_items.forEach(async (lineItem) => {
                        const product = new Product(lineItem.product_id, lineItem.variant_id, lineItem.grams, lineItem.quantity)
                       orderItem.pushProduct(product);
                    })
                    ordersArray.push(orderItem);
                })

                
                return ordersArray;
            }
        } catch(e) {
            console.log(`Error retreiving products: ${e}`)
        }
    }
}

export default OrdersDAO;