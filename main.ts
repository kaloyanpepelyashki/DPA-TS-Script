
import ShopifyClient from "./Models/ShopifyClient";

const main = async () => {
    const shopifyClient = new ShopifyClient();

    const response = await shopifyClient.findCollection();

    console.log(response);
}

main();