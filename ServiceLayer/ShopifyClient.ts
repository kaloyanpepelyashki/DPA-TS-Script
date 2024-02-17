import dotenv from "dotenv";
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion, Session, Shopify } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
dotenv.config();

/** This class provides access to the shopify APIs through the shopify client */
class ShopifyClient {
    private secretKey: string;
    private accessToken: string;
    protected  shopify: Shopify;
    protected session: Session;
    constructor() {
        this.secretKey = process.env.SHOPIFY_API_SECRET_KEY;
        this.accessToken = process.env.SHOPIFY_API_TOKEN;
        this.shopify = shopifyApi({
            apiSecretKey: this.secretKey,          
            apiVersion: ApiVersion.January24,
            isCustomStoreApp: true,                       
            adminApiAccessToken: this.accessToken, 
            isEmbeddedApp: false,
            hostName: "ebits-dk.myshopify.com",
            // Mount REST resources.
            restResources,
          });
        this.session= this.shopify.session.customAppSession("ebits-dk.myshopify.com");
    }

    public async findCollection() {
        try{
            const response = await this.shopify.rest.Collection.find({
                session: this.session,
                id: 608081805635
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
        } catch(e) {
            console.log(`Error getting products from collection ${collectionId}: ${e.message}`);
        }
    }

    public getClient() {
        return this.shopify
    }

    public getSession() {
        return this.session;
    }
}

export default ShopifyClient;