import ShopifyClient from "./ShopifyClient";
import Order from "../Models/Order";

/** A class that is in charge of getting the orders objects from the Shopify database
 * The class extends the ShopifyClient client class and thus has access to all members part of the ShopifyClient class
 */ 
class OrdersDAO extends ShopifyClient {
    constructor() {
        super();
    }


    /** This method returns the whole orders object
     * @param date: string (ISO 8601)
     * @param limmit: number (the limit of products shown)
     */
    public async getOrdersOBJAfter(beforeDate: string, limit?: number) {
        try{
            const response = await this.shopify.rest.Order.all({
                session: this.session,
                status: "closed",
                created_at_min: beforeDate,
                limit: limit
            })

            return response;
        } catch(e) {
            console.log(`Error retreiving orders: ${e}`)
        }
    }
    /** This method returns an array of product's ID's that fit the condition of being ordered after the specific date
     * @param date string (ISO 8601)
     * @param limmit number (the limit of products shown)
     */
    public async getOrdersProductIDBeofre(beforeDate: string, limit?: number) {
        try{
            const response = await this.getOrdersOBJAfter(beforeDate, limit);

            if(response.data.length > 0) {
                let ordersArray = [];
                response.data.forEach((order) => {
                    order.line_items.forEach((lineItem) => {
                        const orderItem = new Order(lineItem)
                        // productsIDArray.push(lineItem.product_id);
                        ordersArray.push(orderItem);
                    })
                })

                
                return ordersArray;
            }
        } catch(e) {
            console.log(`Error retreiving products's ids : ${e}`)
        }
    }
}

export default OrdersDAO;