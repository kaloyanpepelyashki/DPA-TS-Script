import ShopifyClient from "./ShopifyClient";

/** This class is in charge of retreiving products from the shopify database */
class ProductDAO extends ShopifyClient {
    constructor() {
        super();
    }

    /** This method returns the products that belong to a collectio 
     * @param collectionId:number
     */
    public async getProductByCollectionId(collectionId: number) {
        try{
            const response = await this.shopify.rest.Product.all({
                session: this.session,
                collection_id: collectionId,
             
            })

            return response;
        } catch(e) {
            console.log(`Error getting products from session ${collectionId}: ${e.message}`)
        }
    }
}


export default ProductDAO;