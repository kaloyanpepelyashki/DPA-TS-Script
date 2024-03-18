import { Session, Shopify } from "@shopify/shopify-api";
import ShopifyClient from "../ShopifyClient";

export default class CollectionsManager {
  public static instance: CollectionsManager;
  private shopifyClient: ShopifyClient;
  private shiopify: Shopify;
  protected graphQlClient;
  protected constructor() {
    this.shopifyClient = new ShopifyClient();
    this.shiopify = this.shopifyClient.getShopifyInstance().shopify;
    const session: Session = this.shopifyClient.getShopifyInstance().session;
    this.graphQlClient = new this.shiopify.clients.Graphql({ session });
  }

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new CollectionsManager();
    }

    return this.instance;
  }

  public createCollection(collectionName: string) {
    try {
      const result = this.graphQlClient.query({
        data: {
          query: `mutation CollectionCreate($input: CollectionInput!) {
                    collectionCreate(input: $input) {
                      userErrors {
                        field
                        message
                      }
                      collection {
                        id
                        title
                        descriptionHtml
                        handle
                        sortOrder
                        ruleSet {
                          appliedDisjunctively
                          rules {
                            column
                            relation
                            condition
                          }
                        }
                      }
                    }
                  }`,
          variables: {
            input: {
              title: collectionName,
              descriptionHtml: "A test WEEE collection",
              ruleSet: {
                appliedDisjunctively: false,
                rules: {
                  column: "TITLE",
                  relation: "CONTAINS",
                  condition: "shoe",
                },
              },
            },
          },
        },
      });

      return result;
    } catch (e: any) {
      console.log(`Error creating collection: ${e}`);
      throw new Error(`Error creating collection: ${e.message}`);
    }
  }
}
