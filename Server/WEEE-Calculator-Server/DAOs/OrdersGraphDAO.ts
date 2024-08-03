import Order from "../Models/Order";
import ShopifyClient from "../ServiceLayer/ShopifyClient";

class OrdersGraphDAO extends ShopifyClient {
  protected graphQlClient;
  public constructor(accessToken: string, hostName: string) {
    super(accessToken, hostName);
    this.graphQlClient = new this.shopify.clients.Graphql({
      session: this.session,
    });
  }

  //TODO Test if this method works as expected
  public async getOrdersCountFor(
    fromDate: string,
    toDate: string,
    country: string
  ): Promise<{ isSuccess: boolean; count: number }> {
    try {
      const response = await this.graphQlClient.request(
        //TODO Test out if this query works correctly.
        `query ($country: String, $minDate: DateTime, $maxDate: DateTime) {
          orders(query: "financial_status:paid, created_at:>= $minDate, created_at:<= $maxDate, shipping_address.country: $country") {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
        {
          variables: {
            country: country,
            minDate: fromDate,
            maxDate: toDate,
          },
          retries: 2,
        }
      );
      if (response.body.data.orders.edges.length > 0) {
        return {
          isSuccess: true,
          count: response.body.data.orders.edges.length,
        };
      }

      return { isSuccess: false, count: 0 };
    } catch (e) {
      console.log(`Error in OrdersGraphDAO, error getting orders count: ${e}`);
      throw e;
    }
  }
}

export default OrdersGraphDAO;
