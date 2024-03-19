import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";
import CollectionGraphDao from "./ServiceLayer/DAOs/CollectionsGraphDAO";
import CollectionsAgent from "./ServiceLayer/CreateCollections/CollectionsManager";
import ProductDAO from "./ServiceLayer/DAOs/ProductDAO";

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const port = 3000;

app.get("/", async (req, res) => {
  const collectionsTotal = new CollectionsTotalWeightMap();
  const collectionsTotalWeight =
    await collectionsTotal.getCollectionsTotalWeight();

  const valuesArray: Array<number> = Array.from(
    collectionsTotalWeight.values()
  );

  res.send(JSON.stringify(valuesArray));
});

app.get("/createCollection", async (req, res) => {
  const graphDao = CollectionGraphDao.getInstance();
  const result = await graphDao.findCollectionIdByName("test collection title");

  console.log(result);
});

app.get("/products/all", async (req, res) => {
  const productsDao = ProductDAO.getInstance();
  const products = await productsDao.getProductsList();
  res.send(JSON.stringify(products));
});

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
