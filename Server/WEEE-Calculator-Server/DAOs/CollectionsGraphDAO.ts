import ResourceNotFound from "../ExceptionModels/ResourceNotFoundException";
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

      console.log(
        "response in findCollectionIdByName in CollectionsGraphDAO: ",
        response
      );
      if (response.data.collectionByHandle != null) {
        const collectionId = response.data.collectionByHandle.id;

        const formattedId: string = collectionId.match(/\/(\d+)$/);
        if (formattedId) {
          return formattedId[1];
        } else {
          return null;
        }
      }

      throw new ResourceNotFound(
        `Could not find collection with name ${collectionName}`
      );
    } catch (e) {
      throw e;
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
   * @param collectionName the name that should be saved as a name of the newly created collection
   * @param collectionDescription the description that describes the purpose of the newly created collection
   * @returns { isSuccess: boolean; error?: string } the isSuccess represents whether the action executed successfully or not, the error message represents an error message if any
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
              }
            }
          }
        }`,
        {
          variables: {
            input: {
              title: collectionName,
              descriptionHtml: collectionDescription,
            },
          },
          retries: 2,
        }
      );

      if (result.data.collectionCreate.userErrors.length > 0) {
        console.log(
          "Error in CollectionsGraphDAO createCollection. result: ",
          result
        );
        return {
          isSuccess: false,
          error: `Error creating collection: ${result.data.collectionCreate.userErrors}`,
        };
      } else {
        return { isSuccess: true };
      }
    } catch (e: any) {
      console.log(
        `Error in CollectionsGraphDAO createCollection. Error creating collection: ${e}`
      );
      throw e;
    }
  }

  /**
   * This method pushes an array of product id's to a collection, usng the graphQl Shopify API
   * @param collectionId the target collection products will be added to
   * @param products the array of product ids that are to be added
   * @returns { isSuccess: boolean }
   */
  public async addProductsToCollection(
    collectionId: string,
    products: Array<string>
  ): Promise<{ isSuccess: boolean }> {
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
            id: collectionId,
            productIds: productsArray,
          },
          retries: 2,
        }
      );
      if (!result.data.collectionAddProducts.collection) {
        console.log(
          "Error adding products to collection: ",
          result.data.collectionAddProducts.userErrors[0]
        );
        throw new Error(
          `Error adding products to collection: ${result.data.collectionAddProducts.userErrors[0]}`
        );
      } else {
        return { isSuccess: true };
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * This method pushes an array of product id's to a collection, usng the graphQl Shopify API
   * @param collectionId the target collection products will be removed from
   * @param products the array of product ids that are to be removed
   * @returns {isSuccess: boolean, error?: string} isSuccess
   */
  public async removeProductsFromCollection(
    collectionId: string,
    products: Array<string>
  ): Promise<{
    isSuccess: boolean;
  }> {
    try {
      let productsArray: Array<string> = [];

      //Note the id's need to be pushed to an array, and afterwards the array is being pushed to the object being sent to the Shopify db
      products.forEach((product) => {
        productsArray.push(`gid://shopify/Product/${product}`);
      });

      const result = await this.graphQlClient.request(
        `mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
      collectionRemoveProducts(id: $id, productIds: $productIds) {
        job {
          done
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
        {
          variables: {
            id: collectionId,
            productIds: productsArray,
          },
        }
      );
      if (!result.data.collectionAddProducts.collection) {
        console.log(
          "Error adding products to collection: ",
          result.data.collectionAddProducts.userErrors[0]
        );
        throw new Error(
          `Error adding products to collection: ${result.data.collectionAddProducts.userErrors[0]}`
        );
      } else {
        return { isSuccess: true };
      }
    } catch (e) {
      throw e;
    }
  }
}

export default CollectionsGraphDAO;
