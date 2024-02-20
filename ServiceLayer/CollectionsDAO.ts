import ShopifyClient from "./ShopifyClient";

/**This data access class is in charge of getting the collections object from the Shopify Database  */
class CollectionsDAO extends ShopifyClient {
    public static instance: CollectionsDAO;
    private constructor(){
        super();
    }

    public static getInstance() {
        if(this.instance == null){
            this.instance = new CollectionsDAO();
        }

        return this.instance;
    }

    public async findCollection(collectionId: number) {
        try{
            const response = await this.shopify.rest.Collection.find({
                session: this.session,
                id: collectionId
            })
        
            console.log(response);
            return response;
        } catch(e) {
            console.log(`Error finding collection: ${e.message}`);
        }
    }

    public async getCollectionProducts(collectionId: number) {
        try{ 
            const response = await this.shopify.rest.Collection.products({
                session: this.session,
                id: collectionId
            })

            return response;
        } catch(e) {
            console.log(`Error getting products from collection ${collectionId}: ${e.message}`);
        }
    }

    public async getSmartCollectionOnProductId(productId: number) {
        try{
            const response = this.shopify.rest.SmartCollection.all({
                session: this.session,
                product_id: productId
            })

            return response;
        } catch(e) {
            console.log(`Error getting smart collection by product Id ${productId}: ${e.message}`);
            return null;
        }
    }
}

export default CollectionsDAO;