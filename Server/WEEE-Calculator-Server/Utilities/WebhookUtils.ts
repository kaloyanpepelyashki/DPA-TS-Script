import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { routeErrorLogger } from "../Helpers/Logger";

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

/**
 * This method is used for validating the request is comming for Shopify.
 * Uses HMAC verification to ensure the request is made by Shopify
 * @param route The route where the request was sent
 * @param req The express Request object
 * @param res The express Response object
 * @param next
 * @returns void
 */
export const verifyShopifyWebhook = (
  route: string,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    const rawBody = (req as any).rawBody as Buffer;
    const hash = crypto
      .createHmac("sha256", SHOPIFY_API_SECRET)
      .update(rawBody)
      .digest("base64");

    if (hash === hmacHeader) {
      next();
    } else {
      routeErrorLogger(route, req, "Unauthorized", 401);

      res.status(401).send("Unauthorized");
      return;
    }
  } catch (error) {
    routeErrorLogger(route, req, error, 500);

    res.status(500).send("Internal Server Error");
    return;
  }
};
