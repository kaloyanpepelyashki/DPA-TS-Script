import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";
import CollectionsManager from "./ServiceLayer/Services/CollectionsManager";
import ProductsManager from "./ServiceLayer/Services/ProductsManager";

import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

//TODO The whole server needs to be changed structure, as it needs to be prepared to receive and handle accessToken and host with each request and pass it to the different classes, so it can be passed to the Shopify client and thus authenticate and sync back-end with front-end app.
//Instance of the collections manager class
const collectionsManager: CollectionsManager = CollectionsManager.getInstance();
//Instance of the collections total weight class
const collectionsTotalWeightMap: CollectionsTotalWeightMap =
  new CollectionsTotalWeightMap();

app.post("/initCalculation", async (req, res) => {
  try {
    const collectionTitles: Array<string> = req.body;
    console.log(collectionTitles);
    const collectionsTotalWeight =
      await collectionsTotalWeightMap.getCollectionsTotalWeight(
        collectionTitles
      );

    res
      .status(200)
      .send(JSON.stringify(Object.fromEntries(collectionsTotalWeight)));
  } catch (e) {
    res.status(501).send(`Internal server error ${e}`);
  }
});

/**
 * This route is designated for creating collections
 * The rout expects to get an array of objects containing collection name and description, that are to be created.
 */
// app.post("/createCollections", async (req, res) => {
//   try {
//     const collections = req.body;
//     const result = collectionsManager.createCollectionsFor(collections);

//     if (result) {
//       res.status(201).send("Collections created");
//     }
//   } catch (e) {
//     res.status(501).send(`Internal server error: ${e}`);
//   }
// });

/**
 * This route is designated for getting all products
 * sends back an array of product objects
 */
// app.get("/products/all", async (req, res) => {
//   try {
//     const productManager = ProductsManager.getInstance();
//     const products = await productManager.getAllActiveProducts();
//     if (products) {
//       res.status(200).send(JSON.stringify(products));
//     } else {
//       res.status(404).send("Not found");
//     }
//   } catch (e) {
//     res.status(501).send(`Internal server error: ${e}`);
//   }
// });

app.get("/products/all", async (req, res) => {
  try {
    const accessToken: string = req.headers["access-token"] as
      | string
      | undefined;
    const hostName: string = req.headers["host-name"] as string | undefined;

    console.log("accessToken: ", accessToken);
    console.log("host-name: ", hostName);
    if (!accessToken || !hostName) {
      res.status(404).send("Missing headers");
      console.log("Error, missing headers");
      return;
    } else {
      const productManager = new ProductsManager(accessToken, hostName);

      const productList = await productManager.getAllActiveProducts();
      console.log(productList);

      res.send(productList);
    }
  } catch (e) {
    console.log("Error getting all products", e);
  }
});

/**
 * This rout is designated for adding products to a collection
 * The route expects an string array of product ids and a collection name.
 */
// app.post("/addProductsToCollection", async (req, res) => {
//   try {
//     const collection: string = req.body.collection;
//     const products: Array<string> = req.body.products;

//     const collectionId: string | null =
//       await collectionsManager.getCollectionIdByName(collection);

//     if (!collectionId) {
//       res.status(400).send(`Collection ${collection} does not exist`);
//     } else {
//       const result = await collectionsManager.addProductsToCollection(
//         collectionId,
//         products
//       );
//       if (result) {
//         res.status(201).send("Products added to collection");
//       }
//     }
//   } catch (e) {
//     res.status(501).send(`Internal server error ${e}`);
//   }
// });

app.listen(port, async () => {
  console.log(`app is running on ${port}`);
});
