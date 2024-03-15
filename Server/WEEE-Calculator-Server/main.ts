import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";
import OrdersDAO from "./ServiceLayer/DAOs/OrdersDAO";
import CollectionsAgent from "./ServiceLayer/CreateCollections/CreateCollections";

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
  const collectionsAgent = CollectionsAgent.getInstance();

  collectionsAgent.createCollection();
});

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
