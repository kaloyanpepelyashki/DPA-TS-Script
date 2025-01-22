import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import webHookRouter from "./Routes/webhooksRouter";

//Services Imports
import CollectionsCalculator from "./ServiceLayer/Services/CollectionsCalculator";

//DAO Factory
import DaoFactory from "./Factory/DaoFactory";

//DAO imports
import CollectionsGraphDAO from "./Modules/Collection/DAOs/CollectionsGraphDAO";
import CollectionsDAO from "./Modules/Collection/DAOs/CollectionsDAO";
import OrdersDAO from "./Modules/Order/DAOs/OrdersDAO";

//Utilities Imports
import RequestUtils from "./Infrastructure/Utilities/RequestUtils ";
import OrdersManager from "./Modules/Order/Services/OrdersManager";
import OrdersGraphDAO from "./Modules/Order/DAOs/OrdersGraphDAO";
import {
  routeErrorLogger,
  errorLogger,
  routeResponseLogger,
} from "./Infrastructure/Loggers/Logger";
import healthRouter from "./Routes/HealthRouter";

//Router imports
import collectionRouter from "./Modules/Collection/Routers/collectionRouter";
import productRouter from "./Modules/Product/Routers/productRouter";

//Queue Workers
import { shopRedactWorker } from "./Infrastructure/Workers/webhooks_queue_worker"; //Don't erase this line

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

//========= Health check routes ======== //
app.use("/health", healthRouter);

//========= Web hook routes ======== //
app.use("/gdpr-compliance/webhooks", webHookRouter);

//========= Web API routes ======== //
app.use("/api/v1", collectionRouter);

app.use("/api/v1", productRouter);

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
