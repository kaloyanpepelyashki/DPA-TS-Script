import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";
import OrdersDAO from "./ServiceLayer/OrdersDAO";

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

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
