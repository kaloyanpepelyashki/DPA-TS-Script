import ShopifyClient from "../ShopifyClient";

class CollectionsGraphDAO extends ShopifyClient {
  protected static instance: CollectionsGraphDAO;
  protected graphQlClient;
  protected constructor() {
    super();
    this.graphQlClient = new this.shopify.clients.Graphql({
      session: this.session,
    });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CollectionsGraphDAO();
    }
    return this.instance;
  }

  /**This method finds the collection id based on its name
   * @param collectionName
   * @returns { string id |  null } The id of the collection found by name or null
   */
  public async findCollectionIdByName(collectionName: string): Promise<string> {
    try {
      const regEx: RegExp = new RegExp("\\s", "g");
      const collectionHandle = collectionName.replace(regEx, "-");
      console.log(collectionHandle);
      const response = await this.graphQlClient.query({
        data: {
          query: `query getCollectionIdFromHandle($handle: String!) {
                  collectionByHandle(handle: $handle) {
                    id
                  }
                }`,
          variables: {
            handle: collectionHandle,
          },
        },
      });

      const collectionid = response.body.data.collectionByHandle.id;
      const formattedId: string = collectionid.match(/\/(\d+)$/);

      if (formattedId) {
        return formattedId[1];
      } else {
        return null;
      }
    } catch (e) {
      throw new Error(`${e.message}`);
    }
  }
  /**
   *This method uses the shopify graphQl client and creates a collection in the vendor's store
   * @param collectionName
   * @param collectionDescription
   * @returns void
   */
  public createCollection(
    collectionName: string,
    collectionDescription: string
  ): void {
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
              descriptionHtml: collectionDescription,
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

export default CollectionsGraphDAO;
