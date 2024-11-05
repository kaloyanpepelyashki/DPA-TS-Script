import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { verifyShopifyWebhook } from "../Utilities/WebhookUtils";

const webHookRouter = express();

/** Requests to delete shop data
 * This route is used by the system for requesting to delete shop data
 */
webHookRouter.post(
  "/shop/redact",
  async (req: Request, res: Response, next: NextFunction) => {
    const ROUTE = req.baseUrl + req.path;
    verifyShopifyWebhook(ROUTE, req, res, next);
  }
);

/** Requests to delete customer data
 * This route is used by the system for requesting to delete customer data
 */
webHookRouter.post(
  "/customer/redact",
  async (req: Request, res: Response, next: NextFunction) => {
    const ROUTE = req.baseUrl + req.path;
    res.send(`this is the webhooks/${ROUTE}`);
    verifyShopifyWebhook(ROUTE, req, res, next);

    res.status(200).send("No customer data has been stored");
  }
);

/** Requests to view stored customer data
 * This route is used by the system for requesting to view stored customer data
 */
webHookRouter.post(
  "/customer/data_request",
  async (req: Request, res: Response, next: NextFunction) => {
    const ROUTE = req.baseUrl + req.path;
    verifyShopifyWebhook(ROUTE, req, res, next);
  }
);

export default webHookRouter;
