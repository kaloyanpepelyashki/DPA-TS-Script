import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";
import OrdersDAO from "./ServiceLayer/OrdersDAO";

const main = async () => {
  const collectionsTotal = new CollectionsTotalWeightMap();
  const collectionsTotalWeight =
    await collectionsTotal.getCollectionsTotalWeight();
  console.log(collectionsTotalWeight);

  // const ordersDao: OrdersDAO = OrdersDAO.getInstance();

  // ordersDao.getAllOrdersAfter("2023-01-01 12:00:00.000");
};
main();
