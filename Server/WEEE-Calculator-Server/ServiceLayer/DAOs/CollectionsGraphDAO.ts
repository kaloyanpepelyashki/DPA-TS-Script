import ShopifyClient from "../ShopifyClient";

export default class CollectionGraphDao extends ShopifyClient {
  protected static instance: CollectionGraphDao;
  protected graphQlClient;
  protected constructor() {
    super();
    this.graphQlClient = new this.shopify.clients.Graphql({
      session: this.session,
    });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CollectionGraphDao();
    }
    return this.instance;
  }

  /**
   *
   * @param collectionName
   * @returns The id of the collection found by name
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
      const idMatch: RegExp = /\/(\d+)$/;
      const match: string = collectionid.match(idMatch);

      if (match) {
        return match[1];
      } else {
        return null;
      }
    } catch (e) {
      throw new Error(`${e.message}`);
    }
  }
}
