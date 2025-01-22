import express, { NextFunction, Request, Response } from "express";
import RequestUtils from "../../../Infrastructure/Utilities/RequestUtils ";
import {
  routeErrorLogger,
  routeResponseLogger,
} from "../../../Infrastructure/Loggers/Logger";

//DAO Factory
import DaoFactory from "../../../Factory/DaoFactory";

//DAO imports
import ProductsDAO from "../../Product/DAOs/ProductsDAO";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";
import CollectionsDAO from "../DAOs/CollectionsDAO";

//Service layer imports
import CollectionsManager from "../Services/CollectionsManager";
import ProductsManager from "../../Product/Services/ProductsManager";

//Model imports
import Collection from "../Models/Collection";
import Product from "../../Product/Models/Product";

const collectionRouter = express();

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
collectionRouter.post(
  "/createCollection",
  async (req: Request, res: Response) => {
    const ROUTE = req.baseUrl + req.path;
    try {
      console.log(`============= \n ${ROUTE} requested by: ip `, req.ip);

      const { accessToken, hostName } = RequestUtils.extractHeaders(req);

      if (!accessToken || !hostName) {
        routeErrorLogger(ROUTE, req, "Missing headers", 400);

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
        routeErrorLogger(ROUTE, req, result.error, 500);

        res
          .status(500)
          .send("Error creating collections. Internal server error");
        return;
      }

      if (result.isSuccess) {
        routeResponseLogger(
          ROUTE,
          req,
          "Collections created successfully",
          201
        );

        res.status(201).send("Collections created");
        return;
      } else {
        routeErrorLogger(
          ROUTE,
          req,
          result.error ? result.error : "Action unsuccessful",
          500
        );

        res.status(500).send("Error creating collections");
        return;
      }
    } catch (e) {
      routeErrorLogger(ROUTE, req, "Internal server error", 500);

      res.status(500).send(`Internal server error`);
      return;
    }
  }
);

/**
 * This route is designated for getting all WEEE collections from vendor's store
 * The route expects headers with string accessToken and string hostName
 */
collectionRouter.get("/weeeCollections/all", async (req, res) => {
  const ROUTE = req.baseUrl + req.path;
  try {
    console.log(`============= \n ${ROUTE} requested by: IP `, req.ip);

    const { accessToken, hostName } = RequestUtils.extractHeaders(req);

    if (!accessToken || !hostName) {
      routeErrorLogger(ROUTE, req, "Missing headers", 400);

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
      routeErrorLogger(ROUTE, req, result.error, 500);

      res
        .status(500)
        .send(`Error getting weee collections. Internal server error`);
      return;
    }

    if (result.isSuccess) {
      if (result.collections && result.collections.length <= 0) {
        routeResponseLogger(
          ROUTE,
          req,
          "No WEEE collections found in vendor's store",
          404
        );

        res.status(404).send("No WEEE collections found");
        return;
      }
      routeResponseLogger(
        ROUTE,
        req,
        "WEEE collections retreived successfully",
        200
      );

      res.status(200).send(JSON.stringify(result.collections));
      return;
    }

    routeErrorLogger(ROUTE, req, "Internal server error", 500);

    res
      .status(500)
      .send(`Error getting all weee collections. Internal server error`);
    return;
  } catch (e) {
    routeErrorLogger(ROUTE, req, e, 500);

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
collectionRouter.get("/collection/:id/products/all", async (req, res) => {
  const ROUTE = req.baseUrl + req.path;
  try {
    console.log(`============= \n ${ROUTE} requested by: IP `, req.ip);

    const { accessToken, hostName } = RequestUtils.extractHeaders(req);
    const collectionId = Number(req.params.id);

    if (!accessToken || !hostName) {
      routeErrorLogger(ROUTE, req, "Missing headers", 400);

      res.status(400).send("Missing headers");
      return;
    }

    //Initialising the DAO factory class
    const daoFactory: DaoFactory = new DaoFactory(accessToken, hostName);

    //Getting the needed DAOs
    const productsDAO: ProductsDAO = daoFactory.getDAO("productsDao");

    //initialising the collectionsManager class
    const productsManager: ProductsManager = new ProductsManager(productsDAO);

    const result: {
      isSuccess: boolean;
      products: Product[];
      error?: string;
    } = await productsManager.getProductsForCollection(collectionId);

    if (result.error) {
      routeErrorLogger(ROUTE, req, result.error, 500);

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
          ROUTE,
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
        ROUTE,
        req,
        "Collection products retreived successfully",
        200
      );

      res.status(200).send(result.products);
      return;
    }

    routeErrorLogger(ROUTE, req, "Internal server error", 500);

    //Returns 500 if error occured
    res
      .status(500)
      .send("Error getting collections's all products. Internal server error");
  } catch (e) {
    routeErrorLogger(ROUTE, req, e, 500);

    res
      .status(500)
      .send(`Error getting collections's all products. Internal server error`);
    return;
  }
});

export default collectionRouter;
