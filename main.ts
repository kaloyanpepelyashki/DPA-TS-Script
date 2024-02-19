
import ShopifyClient from "./ServiceLayer/ShopifyClient";
import ProductsDAO from "./ServiceLayer/ProductDAO";
import OrdersDAO from "./ServiceLayer/OrdersDAO";


const main = async () => {


    const ordersDao = OrdersDAO.getInstance();

     const orders = await ordersDao.getOrdersProductIDAfter("2023-03-30 12:00:00.000");

     orders.forEach((order) => {
        console.log("Order: ")
        order.products.forEach((product) => {
            console.log(product)
        })
     })
}
main();