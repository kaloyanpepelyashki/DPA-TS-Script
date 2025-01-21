import express, { NextFunction, Request, Response } from "express";
import { verifyShopifyWebhook } from "../Utilities/WebhookUtils";
import PgsqlAccessor from "../Database/PgsqlAccessor";
import { routeErrorLogger, routeResponseLogger } from "../Helpers/Logger";

const webHookRouter = express();

/** Requests to delete shop data
 * This route is used by the system for requesting to delete shop data
 */
webHookRouter.post(
  "/shop/redact",
  express.text({ type: "*/*" }),
  verifyShopifyWebhook,
  async (req: Request, res: Response, next: NextFunction) => {
    const ROUTE = req.baseUrl + req.path;
    const hostName = req.body.shop;
    const pgSqlAccessor = new PgsqlAccessor();

    const queryResult = pgSqlAccessor.deleteShopRecord(hostName);

    if (queryResult.isSuccess) {
      routeResponseLogger(
        ROUTE,
        req,
        "All shop data erased successfully.",
        200
      );
      res.status(200).send("All shop data erased.");
    }

    routeErrorLogger(ROUTE, req, queryResult.error, 500);
    res.status(500).send("Could not erase shop data. Internal server error.");
  }
);

/** Requests to delete customer data
 * This route is used by the system for requesting to delete customer data
 */
webHookRouter.post(
  "/customer/redact",
  express.text({ type: "*/*" }),
  verifyShopifyWebhook,
  async (req: Request, res: Response, next: NextFunction) => {
    const ROUTE = req.baseUrl + req.path;

    routeResponseLogger(
      ROUTE,
      req,
      "No customer data to erase. No action necessary.",
      200
    );
    res.status(200).send("No customer data was stored.");
  }
);

/** Requests to view stored customer data
 * This route is used by the system for requesting to view stored customer data
 */
webHookRouter.post(
  "/customer/data_request",
  express.text({ type: "*/*" }),
  verifyShopifyWebhook,
  async (req: Request, res: Response, next: NextFunction) => {
    const ROUTE = req.baseUrl + req.path;

    routeResponseLogger(
      ROUTE,
      req,
      "No customer data stored. No action necessary.",
      200
    );

    res.status(200).send("No customer data stored.");
  }
);

export default webHookRouter;
