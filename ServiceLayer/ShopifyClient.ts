import dotenv from "dotenv";
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, ApiVersion, Session, Shopify } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
dotenv.config();

/** This class provides access to the shopify APIs through the shopify client */
class ShopifyClient {
  private secretKey: string;
  private accessToken: string;
  protected shopify: Shopify;
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
    this.session = this.shopify.session.customAppSession(
      "ebits-dk.myshopify.com"
    );
  }
}

export default ShopifyClient;
