
import ShopifyClient from "./ServiceLayer/ShopifyClient";
import ProductsDAO from "./ServiceLayer/ProductDAO";
import OrdersDAO from "./ServiceLayer/OrdersDAO";


const main = async () => {
    // const shopifyClient = new ShopifyClient();

    // const response = await shopifyClient.findCollection();

    // console.log(response);

//     const productDAO: ProductsDAO = new ProductsDAO();

//    console.log( await productDAO.getProductByCollectionId(608081805635));

    const ordersDao = new OrdersDAO();
    // const orders = await ordersDao.getOrdersOBJBefore("2023-03-30 12:00:00.000");

    // orders.data.map((order) => {
    //     order.line_items.forEach((lineItem) => {
    //         console.log(lineItem.product_id)
    //     })
    // })

    const productsIDs = await ordersDao.getOrdersProductIDBeofre("2023-03-30 12:00:00.000");

    console.log(productsIDs)
}

main();