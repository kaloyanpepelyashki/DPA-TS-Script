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
import Product from "./Models/Product";
import OrdersManager from "./ServiceLayer/Services/OrdersManager";
import OrdersGraphDAO from "./DAOs/OrdersGraphDAO";

const app = express();
app.use(express.json());
app.use(cors());
const port = 4000;

//TODO Modify the neccessary methods to also require country the report is being exporeted for
app.post("/api/v1/initCalculation", async (req: Request, res: Response) => {
  try {
    const { accessToken, hostName } = RequestUtils.extractHeaders(req);
    console.log("accessToken: ", accessToken);
    console.log("host-name: ", hostName);

    if (!accessToken || !hostName) {
      const collectionTitles: Array<string> = req.body.collectionTitles;
      //The start and end date of the period the report is being generated for
      const reportFromDate: string | null = req.body.fromDate || null;
      const reportToDate: string | null = req.body.toDate || null;
      const reportCountry: string | null = req.body.country || null;

      if (
        collectionTitles != null &&
        collectionTitles.length > 0 &&
        collectionTitles != null &&
        reportCountry != null
      ) {
        const daoFactory = new DaoFactory(accessToken, hostName);
        const ordersDao: OrdersDAO = daoFactory.getDAO("ordersDao");
        const ordersGraphDao: OrdersGraphDAO =
          daoFactory.getDAO("ordersGraphDao");
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
        const ordersManager: OrdersManager = new OrdersManager(
          ordersDao,
          ordersGraphDao
        );

        const collectionsTotalWeights =
          await collectionsCalculator.calculateCollectionsTotalWeight(
            collectionTitles,
            reportFromDate,
            reportToDate,
            reportCountry
          );
        //Gets the vendor's store orders count for the specified period
        const shopOrdersCount = await ordersManager.getShopOrdersCountFor(
          reportFromDate,
          reportToDate,
          reportCountry
        );

        if (shopOrdersCount.isSuccess && shopOrdersCount.count > 0) {
          res.status(200).send(
            JSON.stringify({
              totalWeights: Object.fromEntries(collectionsTotalWeights),
              ordersCount: shopOrdersCount.count,
            })
          );
        }
      } else {
        res.status(400).send("Missing parameters");
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

/**
 * This route is designated for getting all WEEE collections from vendor's store
 * The route expects headers with string accessToken and string hostName
 */
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
      console.log(result);
      res.status(200).send(JSON.stringify(result));
      return;
    } else if (result == null) {
      console.log(result);
      res.status(404).send("No WEEE collections found");
      return;
    }
  } catch (e) {
    console.log("Error getting weee collections", e);
    res
      .sendStatus(500)
      .send(`Error getting weee collections. Internal server error`);
    return;
  }
});

/**
 * This route is designated for getting all products belonging to a collection
 * The route expects headers with string accessToken and string hostName
 * The route expects to get a collection id url parameter. The parameter is the id of the collection which products need to be fetched.
 */
app.get("/api/v1/collection/:id/products/all", async (req, res) => {
  try {
    const { accessToken, hostName } = RequestUtils.extractHeaders(req);
    const collectionId = Number(req.params.id);

    if (!accessToken || !hostName) {
      res.status(400).send("Missing headers");
      console.log("Error, missing headers");
      return;
    }

    //Initialising the DAO factory class
    const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);

    //Getting the needed DAOs
    const productsDAO: ProductsDAO = daoFactory.getDAO("productsDao");

    //initialising the collectionsManager class
    const productsManager: ProductsManager = new ProductsManager(productsDAO);

    const result: Array<Product> =
      await productsManager.getProductsForCollection(collectionId);

    if (result) {
      res.status(200).send(result);
    } else if (result == null) {
      res.status(404).send("No products were found in the collection.");
    }
  } catch (e) {
    console.log("Error getting collections's all products", e);
    res
      .sendStatus(500)
      .send(`Error getting collections's all products. Internal server error`);
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
        console.log("Error adding productrs to collection.", err);
        res
          .status(500)
          .send(`Error adding products to collection. Internal server error`);
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
