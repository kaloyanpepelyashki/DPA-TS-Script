import express, { Request, Response } from "express";
import cors from "cors";

//Services Imports
import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";
import CollectionsManager from "./ServiceLayer/Services/CollectionsManager";
import ProductsManager from "./ServiceLayer/Services/ProductsManager";
import CollectionsCalculator from "./ServiceLayer/Services/CollectionsCalculator";

import DaoFactory from "./Factory/DaoFactory";

//DAO imports
import ProductsDAO from "./DAOs/ProductsDAO";
import CollectionsGraphDAO from "./DAOs/CollectionsGraphDAO";
import CollectionsDAO from "./DAOs/CollectionsDAO";
import OrdersDAO from "./DAOs/OrdersDAO";

//Utilities Imports
import RequestUtils from "./Utilities/RequestUtils ";
import CollectionProductService from "./ServiceLayer/Services/CollectionsProductService";
import ResourceNotFound from "./ExceptionModels/ResourceNotFoundException";
import Collection from "./Models/Collection";

const app = express();
app.use(express.json());
app.use(cors());
const port = 4000;

app.post("/api/v1/initCalculation", async (req: Request, res) => {
  try {
    const { accessToken, hostName } = RequestUtils.extractHeaders(req);
    console.log("accessToken: ", accessToken);
    console.log("host-name: ", hostName);

    if (!accessToken || !hostName) {
      const collectionTitles: Array<string> = req.body;

      if (collectionTitles.length > 0 && collectionTitles != null) {
        const daoFactory = new DaoFactory(accessToken, hostName);
        const ordersDao: OrdersDAO = daoFactory.getDAO("ordersDao");
        const collectionsRestDao: CollectionsDAO =
          daoFactory.getDAO("collectionsRestDao");
        const collectionsGraphDao: CollectionsGraphDAO = daoFactory.getDAO(
          "collectionsGraphDao"
        );

        const collectionsCalculator = new CollectionsCalculator(
          ordersDao,
          collectionsRestDao,
          collectionsGraphDao
        );
        const collectionsTotalWeights =
          await collectionsCalculator.calculateCollectionsTotalWeight(
            collectionTitles
          );

        res
          .status(200)
          .send(JSON.stringify(Object.fromEntries(collectionsTotalWeights)));
      } else {
        res.status(400);
      }
    } else {
      res.status(401);
    }
  } catch (e) {
    res.status(500).send(`Internal server error ${e}`);
  }
});

/**
 * This route is designated for creating collections
 * The route expects headers with string accessToken and string hostName
 * The rout expects to get an array of Maps containing collection name as key and collection description as value.
 */
app.post("/api/v1/createCollection", async (req: Request, res: Response) => {
  try {
    const { accessToken, hostName } = RequestUtils.extractHeaders(req);
    if (!accessToken || !hostName) {
      res.status(400).send("Missing headers");
      return;
    }
    const collections = req.body;
    const collectionsMapsArray: Array<Map<string, string>> = collections.map(
      (obj) => new Map(Object.entries(obj))
    );

    //Initialising the DAO factory class
    const daoFactory = new DaoFactory(accessToken, hostName);
    const collectionsRestDao: CollectionsDAO =
      daoFactory.getDAO("collectionsRestDao");
    const collectionsGraphDao: CollectionsGraphDAO = daoFactory.getDAO(
      "collectionsGraphDao"
    );

    //initialising the collectionsManager class
    const collectionsManager: CollectionsManager = new CollectionsManager(
      collectionsGraphDao,
      collectionsRestDao
    );
    console.log("collections", collections);
    const result: boolean = await collectionsManager.createCollectionsFor(
      collectionsMapsArray
    );

    if (result) {
      res.status(201).send("Collections created");
      return;
    } else {
      res.status(500).send("Error creating collections");
      return;
    }
  } catch (e) {
    console.log("Error creating collections", e);
    res.status(500).send(`Internal server error`);
    return;
  }
});

app.get("/api/v1/weeeCollections/all", async (req, res) => {
  try {
    const { accessToken, hostName } = RequestUtils.extractHeaders(req);

    if (!accessToken || !hostName) {
      res.status(400).send("Missing headers");
      console.log("Error, missing headers");
      return;
    }
    //Initialising the DAO factory class
    const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);

    //Getting the needed DAOs
    const collectionsRestDao: CollectionsDAO =
      daoFactory.getDAO("collectionsRestDao");
    const collectionsGraphDao: CollectionsGraphDAO = daoFactory.getDAO(
      "collectionsGraphDao"
    );

    //initialising the collectionsManager class
    const collectionsManager: CollectionsManager = new CollectionsManager(
      collectionsGraphDao,
      collectionsRestDao
    );

    const result: Array<Collection> =
      await collectionsManager.getWeeeCollections();

    if (result) {
      res.send(200).send(JSON.stringify(result));
    } else {
      res.send(404).send("No WEEE collections found");
    }
  } catch (e) {
    console.log("Error getting weee collections", e);
    res
      .status(500)
      .send(`Error getting weee collections. Internal server error`);
    return;
  }
});

/**
 * This route is designated for getting all products
 * The route expects headers with string accessToken and string hostName
 * The route sends back an array of product objects
 */
app.get("/api/v1/products/all", async (req: Request, res) => {
  try {
    const { accessToken, hostName } = RequestUtils.extractHeaders(req);

    if (!accessToken || !hostName) {
      res.status(400).send("Missing headers");
      console.log("Error, missing headers");
      return;
    }
    const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);
    const productsDao: ProductsDAO = daoFactory.getDAO("productsDao");

    const productManager = new ProductsManager(productsDao);
    const activeProducts = await productManager.getAllActiveProducts();

    console.log(activeProducts);
    res.status(200).send(activeProducts);
    return;
  } catch (e) {
    console.log("Error getting all products", e);
    res.status(500).send(`Error getting all products. Internal server error`);
    return;
  }
});

/**
 * This route is designated for adding products to a collection
 * The route expects headers with string accessToken and string hostName, and a JSON body with:
 * {
 *   "collection": "collectionName",
 *   "products": ["productId", "productId", ...]
 * }
 */
app.post(
  "/api/v1/addProductsToCollection",
  async (req: Request, res: Response) => {
    try {
      const { accessToken, hostName } = RequestUtils.extractHeaders(req);

      if (!accessToken || !hostName) {
        res.status(400).send("Missing headers");
        return;
      }

      const collectionName: string = req.body.collection;
      const products: Array<string> = req.body.products;

      const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);
      const collectionsRestDao: CollectionsDAO =
        daoFactory.getDAO("collectionsRestDao");
      const collectionsGraphDao: CollectionsGraphDAO = daoFactory.getDAO(
        "collectionsGraphDao"
      );
      const collectionsProductService: CollectionProductService =
        new CollectionProductService(collectionsGraphDao, collectionsRestDao);

      const result: boolean =
        await collectionsProductService.addProductsToCollection(
          collectionName,
          products
        );

      if (result) {
        res.status(200).send("Products successfully added to collecton");
        return;
      } else {
        res.status(500).send("Error adding products to collection");
        return;
      }
    } catch (err) {
      if (err instanceof ResourceNotFound) {
        res.status(400).send(err);
        return;
      } else {
        console.log("Server error", err);
        res.status(500).send(`Internal server error`);
        return;
      }
    }
  }
);

app.get("/api/v1/health", async (req: Request, res: Response) => {
  res.status(200).send("Healthy");
});

app.listen(port, async () => {
  console.log(`app is running on ${port}`);
});
