import express, { NextFunction, Request, Response } from "express";
import { verifyShopifyWebhook } from "../Infrastructure/Utilities/WebhookUtils";
import PgsqlAccessor from "../Infrastructure/Database/PgsqlAccessor";
import {
  routeErrorLogger,
  routeResponseLogger,
} from "../Infrastructure/Loggers/Logger";
import { shopRedactQueue } from "../Infrastructure/Queues/webHooks_queue";

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
    //   const pgSqlAccessor = new PgsqlAccessor();

    //   const queryResult = await pgSqlAccessor.deleteShopRecord(hostName);

    //   if (queryResult.isSuccess) {
    //     routeResponseLogger(
    //       ROUTE,
    //       req,
    //       "All shop data erased successfully.",
    //       200
    //     );
    //     res.status(200).send("All shop data erased.");
    //     return;
    //   }

    //   routeErrorLogger(ROUTE, req, queryResult.error, 500);
    //   res.status(500).send("Could not erase shop data. Internal server error.");
    //   return;

    try {
      await shopRedactQueue.add("attemptToDeleteShopRecord", {
        route: ROUTE,
        hostName: hostName,
      });
      res.status(200);
    } catch (e) {
      res.send(500).send("Internal server error");
    }
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
    return;
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
    return;
  }
);

export default webHookRouter;
