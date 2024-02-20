
import ShopifyClient from "./ServiceLayer/ShopifyClient";
import ProductsDAO from "./ServiceLayer/ProductDAO";
import CollectionsDAO from "./ServiceLayer/CollectionsDAO";
import OrdersDAO from "./ServiceLayer/OrdersDAO";
import CollectionsMap from "./BLOC/CollectionsMap"


const main = async () => {
    // const ordersDao = OrdersDAO.getInstance();
    //  const orders = await ordersDao.getOrdersProductIDAfter("2023-03-30 12:00:00.000");
    //  orders.forEach((order) => {
    //     console.log("Order: ")
    //     order.products.forEach((product) => {
    //         console.log(product)
    //     })
    //  })

    // const collectionsDAO = CollectionsDAO.getInstance();
    // const smartCollection = await collectionsDAO.getCollectionProducts(608081805635);

    // console.log(smartCollection)

    const collectionsMap = new CollectionsMap();
    await collectionsMap.initialize();
    console.log(collectionsMap.getDpaCollectionsMap())
}
main();