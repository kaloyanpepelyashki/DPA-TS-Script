import ProductsDAO from "../DAOs/ProductsDAO";
import OrdersDAO from "../DAOs/OrdersDAO";
import CollectionsDAO from "../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";

class DaoFactory {
  private accessToken: string;
  private hostName: string;

  constructor(accessToken: string, hostName: string) {
    this.accessToken = accessToken;
    this.hostName = hostName;
  }

  public getDAO(
    daoType: string
  ): ProductsDAO | OrdersDAO | CollectionsDAO | CollectionsGraphDAO {
    switch (daoType) {
      case "productsDao":
        return new ProductsDAO(this.accessToken, this.hostName);
      case "ordersDao":
        return new OrdersDAO(this.accessToken, this.hostName);
      case "collectionsRestDao":
        return new CollectionsDAO(this.accessToken, this.hostName);
      case "collectionsGraphDao":
        return new CollectionsGraphDAO(this.accessToken, this.hostName);
      default:
    }
  }
}

export default DaoFactory;
