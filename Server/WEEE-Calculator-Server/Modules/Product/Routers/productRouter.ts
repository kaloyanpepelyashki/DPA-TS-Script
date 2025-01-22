import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import RequestUtils from "../../../Infrastructure/Utilities/RequestUtils ";
import {
  routeErrorLogger,
  routeResponseLogger,
} from "../../../Infrastructure/Loggers/Logger";

//DAO Factory
import DaoFactory from "../../../Factory/DaoFactory";
import ResourceNotFound from "../../../ExceptionModels/ResourceNotFoundException";
import CollectionsDAO from "../../Collection/DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../../Collection/DAOs/CollectionsGraphDAO";
import CollectionProductService from "../../../ServiceLayer/Services/CollectionsProductService";
import ProductsDAO from "../DAOs/ProductsDAO";
import ProductsManager from "../Services/ProductsManager";

const productRouter = express();

/**
 * This route is designated for getting all products
 * The route expects headers with string accessToken and string hostName
 * The route sends back an array of product objects
 */
productRouter.get("/api/v1/products/all", async (req: Request, res) => {
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
productRouter.post(
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
productRouter.post(
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

export default productRouter;
