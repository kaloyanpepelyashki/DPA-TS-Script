import ProductsDAO from "../DAOs/ProductsDAO";
import OrdersDAO from "../DAOs/OrdersDAO";
import CollectionsDAO from "../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";

/**
 * A factory class for the different Dao modules
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
   * @param {string} daoType {"productsDao" | "ordersDao" | "collectionsRestDao" | collectionsGraphDao};
   * @returns {ProductsDAO | OrdersDAO | CollectionsDAO | CollectionsGraphDAO}
   */
  public getDAO<
    T extends ProductsDAO | OrdersDAO | CollectionsDAO | CollectionsGraphDAO
  >(
    daoType:
      | "productsDao"
      | "ordersDao"
      | "collectionsRestDao"
      | "collectionsGraphDao"
  ): T {
    switch (daoType) {
      case "productsDao":
        return new ProductsDAO(this.accessToken, this.hostName) as T;
      case "ordersDao":
        return new OrdersDAO(this.accessToken, this.hostName) as T;
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
