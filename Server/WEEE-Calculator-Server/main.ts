import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";
import CollectionGraphDao from "./ServiceLayer/DAOs/CollectionsGraphDAO";
import CollectionsManager from "./ServiceLayer/Services/CollectionsManager";
import ProductsManager from "./ServiceLayer/Services/ProductsManager";

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const port = 3000;

app.get("/", async (req, res) => {
  const collectionsTotal = new CollectionsTotalWeightMap();
  const collectionsTotalWeight =
    await collectionsTotal.getCollectionsTotalWeight([
      "WEEE Light sources",
      "WEEE Small IT and telecommunication equipment",
      "WEEE Portable batteries",
    ]);

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
  const productManager = ProductsManager.getInstance();
  const products = await productManager.getAllActiveProducts();
  res.send(JSON.stringify(products));
});

app.get("/addProductToCol", async (req, res) => {
  const collectionManager = CollectionsManager.getInstance();
  const result = await collectionManager.addProductsToCollection(
    "619669324099",
    ["8639273795907", "8639067816259", "6067180273830", "9072733782339"]
  );

  console.log(result);
});

app.listen(port, async () => {
  console.log(`app is running on ${port}`);
});
