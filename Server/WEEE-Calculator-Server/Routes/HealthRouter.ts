import express, { NextFunction, Request, Response } from "express";
import PgsqlAccessor from "../Infrastructure/Database/PgsqlAccessor";
import { errorLogger, generalLog } from "../Infrastructure/Loggers/Logger";

const healthRouter = express();

healthRouter.get(
  "/database",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      generalLog(`Database healtch check was requested by ip: ${req.ip}`);
      const health = {
        status: " ",
        timeStamp: new Date().toISOString(),
      };

      const pgSqlAccessor = new PgsqlAccessor();
      const databaseHealthCheck = await pgSqlAccessor.databaseConnectionCheck();

      if (databaseHealthCheck.isSuccess) {
        health.status = "Connected";

        res.status(200).send(health);
        return;
      }

      errorLogger(databaseHealthCheck.error);

      health.status = "Not connected";
      res.status(500).send(health);
      return;
    } catch (error: any) {
      errorLogger(error);
      res.status(500).send("Internal server error");
      return;
    }
  }
);

/**
 * This route initiates a health check on the server.
 * The routes sends to the consumer an object with inormation about the health check.
 */
healthRouter.get("/server", async (req: Request, res: Response) => {
  generalLog(`Server health check was requested by ${req.ip}`);

  const health = {
    message: "",
    status: "online",
    uptime: process.uptime(),
    timeStamp: new Date().toISOString(),
    dependencies: {
      database: {
        status: "",
        error: "",
      },
    },
  };

  try {
    const pgSqlAccessor = new PgsqlAccessor();
    const databaseHealthCheck = await pgSqlAccessor.databaseConnectionCheck();

    if (databaseHealthCheck.isSuccess) {
      health.dependencies.database.status = "Connected";

      health.message = "Server is healthy";

      res.status(200).send(health);
      return;
    }

    health.dependencies.database.status = "Not connected";
    health.dependencies.database.error = databaseHealthCheck.errorMessage;

    res.status(200).send(health);
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }
});

export default healthRouter;
