import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

//Services Imports
import CollectionsTotalWeightMap from "./BLOC/CollectionsTotalWeighMap";
import CollectionsManager from "./ServiceLayer/Services/CollectionsManager";
import ProductsManager from "./ServiceLayer/Services/ProductsManager";
import CollectionsCalculator from "./ServiceLayer/Services/CollectionsCalculator";

//DAO Factory
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
import {
  routeErrorLogger,
  errorLogger,
  routeResponseLogger,
} from "./Helpers/Logger";

dotenv.config();

const app = express();
const https = require("https");
const fs = require("fs");

app.use(express.json());

const environment = process.env.ENVIRONMENT;
const port = process.env.PORT || 4000;

if (environment == "PRODUCTION") {
  try {
    // Load SSL certificate and key
    const options = {
      key: fs.readFileSync(
        "/etc/letsencrypt/live/api.weee-calculator.net.ohmio.net/privkey.pem"
      ),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/api.weee-calculator.net.ohmio.net/fullchain.pem"
      ),
    };

    // Create HTTPS server
    https.createServer(options, app).listen(port, () => {
      console.log(
        "Server is running securely on https://api.weee-calcualtor.net.ohmio.net. Port: ",
        port
      );
    });
  } catch (e) {
    errorLogger(e);
  }
} else {
  app.listen(port, async () => {
    console.log(`App is running on ${port}`);
  });
}

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "access-token", "host-name"],
    credentials: true,
  })
);

app.options("*", cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log({
    ip: req.ip,
    method: req.method,
    url: req.url,
    headers: req.headers["user-agent"],
    query: req.query,
    params: req.params,
  });
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const elapsedTime = Date.now() - startTime;
    console.log({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${elapsedTime}ms`,
      ip: req.ip,
    });
  });
  next();
});

app.use((err, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  console.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    status: res.statusCode,
    ip: req.ip,
  });
  res.status(500).send("Something went wrong! Internal server error");
});

//TODO Modify the neccessary methods to also require country the report is being exporeted for
app.post("/api/v1/initCalculation", async (req: Request, res: Response) => {
  const route: string = "/initCalculation";
  try {
    console.log("============= \n/initCalculation requested by: ip ", req.ip);
    const { accessToken, hostName } = RequestUtils.extractHeaders(req);

    if (!accessToken || !hostName) {
      routeErrorLogger(route, req, "Missing headers", 400);

      res.status(400).send("Missing headers");
      return;
    }
    const collectionTitles: Array<string> = req.body.collectionTitles;
    //The start and end date of the period the report is being generated for
    const reportFromDate: string | null = req.body.fromDate || null;
    const reportToDate: string | null = req.body.toDate || null;
    //The country the report is being generated for
    const reportCountry: string | null = req.body.targetCountry || null;

    if (
      collectionTitles != null &&
      collectionTitles.length > 0 &&
      collectionTitles != null &&
      reportCountry != null
    ) {
      console.log("Report requested");
      const daoFactory = new DaoFactory(accessToken, hostName);
      const ordersDao: OrdersDAO = daoFactory.getDAO("ordersDao");
      const ordersGraphDao: OrdersGraphDAO =
        daoFactory.getDAO("ordersGraphDao");
      const collectionsRestDao: CollectionsDAO =
        daoFactory.getDAO("collectionsRestDao");
      const collectionsGraphDao: CollectionsGraphDAO = daoFactory.getDAO(
        "collectionsGraphDao"
      );
      const ordersManager: OrdersManager = new OrdersManager(
        ordersDao,
        ordersGraphDao
      );

      const collectionsCalculator = new CollectionsCalculator(
        ordersManager,
        collectionsRestDao,
        collectionsGraphDao
      );

      const collectionsTotalWeights =
        await collectionsCalculator.calculateCollectionsTotalWeight(
          collectionTitles,
          reportFromDate,
          reportToDate,
          reportCountry
        );
      //Gets the vendor's store orders count for the specified period
      const shopOrdersCount: {
        isSuccess: boolean;
        count: number;
        error?: string;
      } = await ordersManager.getShopOrdersCountFor(
        reportFromDate,
        reportToDate,
        reportCountry
      );

      if (shopOrdersCount.error || collectionsTotalWeights.error) {
        routeErrorLogger(
          route,
          req,
          shopOrdersCount.error ?? collectionsTotalWeights.error,
          500
        );

        res.status(500).send(`Internal server error`);
        return;
      }

      if (shopOrdersCount.isSuccess && collectionsTotalWeights.isSuccess) {
        routeResponseLogger(
          route,
          req,
          "Calculation successful, report sent",
          200
        );

        return res.status(200).send(
          JSON.stringify({
            totalWeights: Object.fromEntries(
              collectionsTotalWeights.collectionsTotalWeights
            ),
            ordersCount: shopOrdersCount.count,
          })
        );
      }
    } else {
      routeErrorLogger(route, req, "Missing parameters", 400);

      res.status(400).send("Missing parameters");
      return;
    }
  } catch (e) {
    routeErrorLogger(route, req, "Internal server error", 500);

    res.status(500).send(`Internal server error`);
    return;
  }
});

/**
 * This route is designated for creating collections
 * The route expects headers with string accessToken and string hostName
 * The rout expects to get an array of Maps containing collection title as key and collection description as value:
 * [
      {
        'collectionTitle': "collectionDescription"
      },
      {
        'collectionTitle': "collectionDescription"
      }, 
    ]
 */
app.post("/api/v1/createCollection", async (req: Request, res: Response) => {
  const route: string = "/createCollection";
  try {
    console.log("============= \n/createCollection requested by: ip ", req.ip);
    const { accessToken, hostName } = RequestUtils.extractHeaders(req);

    if (!accessToken || !hostName) {
      routeErrorLogger(route, req, "Missing headers", 400);

      res.status(400).send("Missing headers");
      return;
    }

    const collections = req.body;
    console.log("collections received: ", collections);

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
    const result: { isSuccess: boolean; error?: string } =
      await collectionsManager.createCollectionsFor(collectionsMapsArray);

    if (result.error) {
      routeErrorLogger(route, req, result.error, 500);

      res.status(500).send("Error creating collections. Internal server error");
      return;
    }

    if (result.isSuccess) {
      routeResponseLogger(route, req, "Collections created successfully", 201);

      res.status(201).send("Collections created");
      return;
    } else {
      routeErrorLogger(
        route,
        req,
        result.error ? result.error : "Action unsuccessful",
        500
      );

      res.status(500).send("Error creating collections");
      return;
    }
  } catch (e) {
    routeErrorLogger(route, req, "Internal server error", 500);

    res.status(500).send(`Internal server error`);
    return;
  }
});

/**
 * This route is designated for getting all WEEE collections from vendor's store
 * The route expects headers with string accessToken and string hostName
 */
app.get("/api/v1/weeeCollections/all", async (req, res) => {
  const route: string = "/weeeCollections/all";
  try {
    console.log(
      "============= \n/weeeCollecations/all requested by: IP ",
      req.ip
    );

    const { accessToken, hostName } = RequestUtils.extractHeaders(req);

    if (!accessToken || !hostName) {
      routeErrorLogger(route, req, "Missing headers", 400);

      res.status(400).send("Missing headers");
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

    const result: {
      isSuccess: boolean;
      collections: Array<Collection>;
      error?: string;
    } = await collectionsManager.getWeeeCollections();

    if (result.error) {
      routeErrorLogger(route, req, result.error, 500);

      res
        .status(500)
        .send(`Error getting weee collections. Internal server error`);
      return;
    }

    if (result.isSuccess) {
      if (result.collections && result.collections.length <= 0) {
        routeResponseLogger(
          route,
          req,
          "No WEEE collections found in vendor's store",
          404
        );

        res.status(404).send("No WEEE collections found");
        return;
      }
      routeResponseLogger(
        route,
        req,
        "WEEE collections retreived successfully",
        200
      );

      res.status(200).send(JSON.stringify(result.collections));
      return;
    }

    routeErrorLogger(route, req, "Internal server error", 500);

    res
      .status(500)
      .send(`Error getting all weee collections. Internal server error`);
    return;
  } catch (e) {
    routeErrorLogger(route, req, e, 500);

    res
      .status(500)
      .send(`Error getting all weee collections. Internal server error`);
    return;
  }
});

/**
 * This route is designated for getting all products belonging to a  collection
 * The route expects headers with string accessToken and string hostName
 * The route expects to get a collection id url parameter. The parameter is the id of the collection which products need to be fetched.
 */
app.get("/api/v1/collection/:id/products/all", async (req, res) => {
  const route: string = "/collection/:id/products/all";
  try {
    console.log(
      "============= \n/collection/:id/products/all requested by: IP ",
      req.ip
    );

    const { accessToken, hostName } = RequestUtils.extractHeaders(req);
    const collectionId = Number(req.params.id);

    if (!accessToken || !hostName) {
      routeErrorLogger(route, req, "Missing headers", 400);

      res.status(400).send("Missing headers");
      return;
    }

    //Initialising the DAO factory class
    const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);

    //Getting the needed DAOs
    const productsDAO: ProductsDAO = daoFactory.getDAO("productsDao");

    //initialising the collectionsManager class
    const productsManager: ProductsManager = new ProductsManager(productsDAO);

    const result: { isSuccess: boolean; products: Product[]; error?: string } =
      await productsManager.getProductsForCollection(collectionId);

    if (result.error) {
      routeErrorLogger(route, req, result.error, 500);

      //Returns 500 if error occured
      res
        .status(500)
        .send(
          "Error getting collections's all products. Internal server error"
        );
    }

    if (result.isSuccess) {
      if (result.products.length == 0) {
        //Still successful operation, but no products found
        routeResponseLogger(
          route,
          req,
          `No products were found that belong to collection ${collectionId} in vendors store.`,
          404
        );

        res
          .status(404)
          .send(
            `No products were found that belong to collection ${collectionId} in vendors store.`
          );
        return;
      }
      routeResponseLogger(
        route,
        req,
        "Collection products retreived successfully",
        200
      );

      res.status(200).send(result.products);
      return;
    }

    routeErrorLogger(route, req, "Internal server error", 500);

    //Returns 500 if error occured
    res
      .status(500)
      .send("Error getting collections's all products. Internal server error");
  } catch (e) {
    routeErrorLogger(route, req, e, 500);

    res
      .status(500)
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
  const route: string = "/api/v1/products/all";
  try {
    console.log("============= \n/products/all  requested by: IP ", req.ip);

    const { accessToken, hostName } = RequestUtils.extractHeaders(req);

    if (!accessToken || !hostName) {
      routeErrorLogger(route, req, "Missing headers", 400);

      res.status(400).send("Missing headers");
      return;
    }
    const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);
    const productsDao: ProductsDAO = daoFactory.getDAO("productsDao");

    const productManager = new ProductsManager(productsDao);
    const result = await productManager.getAllActiveProducts();

    if (result.error) {
      routeErrorLogger(route, req, result.error, 500);

      res.status(500).send("Error getting all products. Internal server error");
      return;
    }

    if (result.isSuccess) {
      if (result.products.length == 0) {
        routeResponseLogger(
          route,
          req,
          `No products were found in vendors store.`,
          404
        );

        res.status(404).send("No products were found in vendors store.");
        return;
      }
      routeResponseLogger(
        route,
        req,
        "All products retreived successfully",
        200
      );

      res.status(200).send(result.products);
      return;
    } else {
      routeErrorLogger(route, req, "Internal server error", 500);

      res.status(500).send("Error getting all products. Internal server error");
      return;
    }
  } catch (e) {
    routeErrorLogger(route, req, e, 500);

    res.status(500).send(`Error getting all products. Internal server error`);
    return;
  }
});

/**
 * This route is designated for adding products to a collection
 * The route expects headers with string accessToken and string hostName, and a JSON body with:
 * {
 *   "collection": "collectionId",
 *   "products": ["productId", "productId", ...]
 * }
 * collection is the collection id of the collection that products will be added to
 * products is an array of product ids that will be added to the collection
 */
app.post(
  "/api/v1/addProductsToCollection",
  async (req: Request, res: Response) => {
    const route: string = "/addProductsToCollection";
    try {
      console.log(
        "============= \n/addProductsToCollection  requested by: IP ",
        req.ip
      );

      const { accessToken, hostName } = RequestUtils.extractHeaders(req);

      if (!accessToken || !hostName) {
        routeErrorLogger(route, req, "Missing headers", 400);

        res.status(400).send({ message: "Missing headers" });
        return;
      }

      const collectionId: string = req.body.collection;
      const products: Array<string> = req.body.products;

      if (typeof collectionId !== "string" || !Array.isArray(products)) {
        routeErrorLogger(route, req, "Parameters of wrong type", 400);

        res.status(400).send({ message: "Prameters are not of correct type" });
        return;
      }

      const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);
      const collectionsRestDao: CollectionsDAO =
        daoFactory.getDAO("collectionsRestDao");
      const collectionsGraphDao: CollectionsGraphDAO = daoFactory.getDAO(
        "collectionsGraphDao"
      );
      const collectionsProductService: CollectionProductService =
        new CollectionProductService(collectionsGraphDao, collectionsRestDao);

      const result = await collectionsProductService.addProductsToCollection(
        collectionId,
        products
      );

      if (result.error) {
        routeErrorLogger(route, req, result.error, 500);

        res
          .status(500)
          .send("Error adding products to collection. Internal server error");
        return;
      }

      if (result.isSuccess) {
        routeResponseLogger(route, req, "Products added successfully", 200);

        res
          .status(200)
          .send({ message: "Products successfully added to collecton" });
        return;
      } else {
        routeErrorLogger(route, req, "Internal server error", 500);

        res
          .status(500)
          .send({ message: "Error adding products to collection" });
        return;
      }
    } catch (err) {
      if (err instanceof ResourceNotFound) {
        routeErrorLogger(route, req, err, 400);

        res.status(400).send(err);
        return;
      } else {
        routeErrorLogger(route, req, err, 500);

        res
          .status(500)
          .send(`Error adding products to collection. Internal server error`);
        return;
      }
    }
  }
);

/**
 * This route is designated for adding products to a collection
 * The route expects headers with string accessToken and string hostName, and a JSON body with:
 * {
 *   "collection": "collectionId",
 *   "products": ["productId", "productId", ...]
 * }
 * collection is the collection id of the collection that products will be removed from
 * products is an array of product ids that will be removed from the collection
 */
app.post(
  "/api/v1/removeProductsFromCollection",
  async (req: Request, res: Response) => {
    const route: string = "/removeProductsFromCollection";
    try {
      console.log(
        "============= \n/removeProductsFromCollection  requested by: IP ",
        req.ip
      );

      const { accessToken, hostName } = RequestUtils.extractHeaders(req);

      if (!accessToken || !hostName) {
        routeErrorLogger(route, req, "Missing headers", 500);

        res.status(400).send("Missing headers");
        return;
      }

      const collectionId = req.body.collection;
      const products = req.body.products;

      if (typeof collectionId !== "string" || !Array.isArray(products)) {
        routeErrorLogger(route, req, "Parameters of wrong type", 500);

        res.status(400).send("Prameters are not of correct type");
        return;
      }

      const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);
      const collectionsRestDao: CollectionsDAO =
        daoFactory.getDAO("collectionsRestDao");
      const collectionsGraphDao: CollectionsGraphDAO = daoFactory.getDAO(
        "collectionsGraphDao"
      );
      const collectionsProductService: CollectionProductService =
        new CollectionProductService(collectionsGraphDao, collectionsRestDao);

      const result: { isSuccess: boolean; error?: string } =
        await collectionsProductService.removeProductsFromCollection(
          collectionId,
          products
        );

      if (result.error) {
        routeErrorLogger(route, req, result.error, 500);

        res.status(500).send("Error removing products. Internal server error");
        return;
      }
      if (result.isSuccess) {
        routeResponseLogger(route, req, "Products removed successfully", 200);

        res
          .status(200)
          .send({ message: "Products successfully removed from collecton" });
        return;
      } else {
        routeErrorLogger(route, req, "Internal server error", 500);

        res
          .status(500)
          .send({ message: "Error removing products from collection" });
        return;
      }
    } catch (err) {
      if (err instanceof ResourceNotFound) {
        res.status(400).send(err);
        return;
      } else {
        routeErrorLogger(route, req, err, 500);

        res
          .status(500)
          .send(
            `Error removing products from collection. Internal server error`
          );
        return;
      }
    }
  }
);

app.get("/api/v1/health", async (req: Request, res: Response) => {
  console.log("============= \nHealth check was requested by ip: ", req.ip);
  res.status(200).send("App is healthy");
});
