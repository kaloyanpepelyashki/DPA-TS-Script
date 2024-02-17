
import ShopifyClient from "./ServiceLayer/ShopifyClient";
import ProductsDAO from "./ServiceLayer/ProductDAO";

const main = async () => {
    // const shopifyClient = new ShopifyClient();

    // const response = await shopifyClient.findCollection();

    // console.log(response);

    const productDAO: ProductsDAO = new ProductsDAO();

   console.log( await productDAO.getProductByCollectionId(608081805635));
}

main();