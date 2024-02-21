
import ShopifyClient from "./ServiceLayer/ShopifyClient";
import ProductsDAO from "./ServiceLayer/ProductDAO";
import CollectionsDAO from "./ServiceLayer/CollectionsDAO";
import OrdersDAO from "./ServiceLayer/OrdersDAO";
import CollectionsMap from "./BLOC/CollectionsMap"
import ProductsSoldMap from "./BLOC/ProductsSoldMap";


const main = async () => {
    // const ordersDao = OrdersDAO.getInstance();
    // const orders = await ordersDao.getOrdersAfter("2023-01-01 12:00:00.000");
    // orders.forEach((order) => {
    //     order.products.forEach((product) => {
    //        if(product.productWeight === 0) {
    //         console.log(`https://admin.shopify.com/store/ebits-dk/products/${product.productID}`);
    //        }
    //     })
    // })

    // const productsDAO = ProductsDAO.getInstance();
    // const productsList = await productsDAO.getProductsList();

    // for(const product of productsList.products) {
    //     product.products.forEach((product) => {
    //         product.variants.forEach((variant) => {  
    //             if(variant.grams === 0) {
    //                 console.log(`https://admin.shopify.com/store/ebits-dk/products/${product.id}/variants/${variant.id}`);
    //             }
    //         })
            
    //     })
    // }



    // const collectionsDAO = CollectionsDAO.getInstance();
    // const smartCollection = await collectionsDAO.getCollectionProducts(608081805635);

    // console.log(smartCollection)

    // const collectionsMap = new CollectionsMap();
    // await collectionsMap.initialize();
    // console.log(collectionsMap.getDpaCollectionsMap())

    //Just test code
    const productsSoldMap = new ProductsSoldMap();
    await productsSoldMap.initialize();
    const products = productsSoldMap.getSoldProductsWeight();
     console.log(products)
}
main();