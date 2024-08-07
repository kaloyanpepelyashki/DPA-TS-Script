import Collection from "../Models/Collection";
import ShopifyClient from "../ServiceLayer/ShopifyClient";
class CollectionsGraphDAO extends ShopifyClient {
  protected graphQlClient;
  public constructor(accessToken: string, hostName: string) {
    super(accessToken, hostName);
    this.graphQlClient = new this.shopify.clients.Graphql({
      session: this.session,
    });
  }

  /**This method finds the collection id based on its name
   * @param collectionName
   * @returns { string id |  null } The id of the collection found by name or null
   */
  public async findCollectionIdByName(collectionName: string): Promise<string> {
    try {
      const regEx: RegExp = new RegExp("\\s", "g");
      const collectionHandle = collectionName.replace(regEx, "-").toLowerCase();
      console.log(collectionHandle);
      //TODO test this method
      const response = await this.graphQlClient.request(
        `query getCollectionIdFromHandle($handle: String!) {
                  collectionByHandle(handle: $handle) {
                    id
                  }
                }`,
        {
          variables: {
            handle: collectionHandle,
            retries: 2,
          },
        }
      );

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
   * This method queries Shopify admin and fetches all collections in vendor's store (currently to 250 collections)
   * @returns {Array<Collection>} all collections in vendor's store as an array
   */
  public async getAllCollections(): Promise<Array<Collection>> {
    try {
      const result = await this.graphQlClient.request(
        `query {
        collections(first: 250) {
          edges {
            node {
              id
              title
              handle
              updatedAt
              sortOrder
            }
          }
        }
      }`,
        {
          variables: {},
          retries: 2,
        }
      );
      if (result.data.collections.edges.length < 0) {
        return null;
      } else {
        const collectionsArray = result.data.collections.edges.map(
          (collection) => {
            return new Collection(
              collection.node.id,
              collection.node.title,
              collection.node.handle
            );
          }
        );
        return collectionsArray;
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   *This method uses the shopify graphQl client and creates a collection in the vendor's store
   * @param collectionName
   * @param collectionDescription
   * @returns boolean
   */
  public async createCollection(
    collectionName: string,
    collectionDescription: string
  ): Promise<{ isSuccess: boolean; error?: string }> {
    try {
      const result = await this.graphQlClient.request(
        `mutation CollectionCreate($input: CollectionInput!) {
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
        {
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
          retries: 2,
        }
      );

      if (result.data.collectionCreate.userErrors.length > 0) {
        return {
          isSuccess: false,
          error: `Error creating collection: ${result.data.collectionCreate.userErrors}`,
        };
      } else {
        return { isSuccess: true };
      }
    } catch (e: any) {
      console.log(`Error creating collection: ${e}`);
      throw e;
    }
  }

  /**
   * This method pushes an array of product id's to a collection, usng the graphQl Shopify API
   * @param collectionId
   * @param products
   * @returns
   */
  //TODO Test this method after it's been refactored to the request method
  public async addProductsToCollection(
    collectionId: string,
    products: Array<string>
  ): Promise<boolean> {
    try {
      let productsArray: Array<string> = [];

      //Note the id's need to be pushed to an array, and afterwards the array is being pushed to the object being sent to the Shopify db
      products.forEach((product) => {
        productsArray.push(`gid://shopify/Product/${product}`);
      });

      const result = await this.graphQlClient.request(
        `mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
          collectionAddProducts(id: $id, productIds: $productIds) {
            collection {
              id
              title
              productsCount
              products(first: 10) {
                nodes {
                  id
                  title
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
        {
          variables: {
            id: `gid://shopify/Collection/${collectionId}`,
            productIds: productsArray,
          },
          retries: 2,
        }
      );
      console.log(result.body.data);
      if (!result.body.data.collection) {
        throw new Error(
          `Error adding products to collection: ${result.body.data.userError}`
        );
      } else {
        return true;
      }
    } catch (e) {
      throw new Error(`${e}`);
    }
  }
}

export default CollectionsGraphDAO;
