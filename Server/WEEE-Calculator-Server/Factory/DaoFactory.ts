import ProductsDAO from "../DAOs/ProductsDAO";
import OrdersDAO from "../DAOs/OrdersDAO";
import CollectionsDAO from "../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";
import OrdersGraphDAO from "../DAOs/OrdersGraphDAO";

/**
 * A factory class for the different Dao modules
 * The class constructor expects parameters string accessToken and string hostName.
 * The accessToken and hostName are passed to the different DAO objects when instantiating them
 */
class DaoFactory {
  private accessToken: string;
  private hostName: string;

  constructor(accessToken: string, hostName: string) {
    this.accessToken = accessToken;
    this.hostName = hostName;
  }

  /**
   * getDao method
   * The method is in charge for returning whichever DAO instance is needed
   * @param {string} daoType {"productsDao" | "ordersDao" | "ordersGraphDao" | "collectionsRestDao" | collectionsGraphDao};
   * @returns {ProductsDAO | OrdersDAO | OrdersGraphDAO | CollectionsDAO | CollectionsGraphDAO}
   */
  public getDAO<
    T extends
      | ProductsDAO
      | OrdersDAO
      | OrdersGraphDAO
      | CollectionsDAO
      | CollectionsGraphDAO
  >(
    daoType:
      | "productsDao"
      | "ordersDao"
      | "ordersGraphDao"
      | "collectionsRestDao"
      | "collectionsGraphDao"
  ): T {
    switch (daoType) {
      case "productsDao":
        return new ProductsDAO(this.accessToken, this.hostName) as T;
      case "ordersDao":
        return new OrdersDAO(this.accessToken, this.hostName) as T;
      case "ordersGraphDao":
        return new OrdersGraphDAO(this.accessToken, this.hostName) as T;
      case "collectionsRestDao":
        return new CollectionsDAO(this.accessToken, this.hostName) as T;
      case "collectionsGraphDao":
        return new CollectionsGraphDAO(this.accessToken, this.hostName) as T;
      default:
        throw new Error(`Invalid DAO type input: ${daoType}`);
    }
  }
}

export default DaoFactory;
