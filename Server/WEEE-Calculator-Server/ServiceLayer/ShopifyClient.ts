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
  protected hostName: string;
  constructor(accessToken: string, hostName: string) {
    this.secretKey = process.env.SHOPIFY_API_SECRET_KEY;
    this.accessToken = accessToken;
    this.hostName = hostName;
    this.shopify = shopifyApi({
      apiSecretKey: this.secretKey,
      apiVersion: ApiVersion.January24, //Should be updated when a new API version is released
      isCustomStoreApp: true,
      adminApiAccessToken: this.accessToken,
      isEmbeddedApp: false,
      hostName: this.hostName,
      // Mount REST resources.
      restResources,
    });
    this.session = this.shopify.session.customAppSession(this.hostName);
  }

  /**
   *
   * @returns An object containing the an instance of shopify and the session
   */
  public getShopifyInstance() {
    return { shopify: this.shopify, session: this.session };
  }
}

export default ShopifyClient;
