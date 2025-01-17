import express, { NextFunction, Request, Response } from "express";

const healthRouter = express();

healthRouter.get(
  "/database",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).send("Database is healthy");
    } catch (e: any) {
      res.status(500).send("Internal server error");
    }
  }
);

healthRouter.get("/server", async (req: Request, res: Response) => {
  console.log("============= \n Health check was requested by ip: ", req.ip);
  res.status(200).send("App is healthy");
});

export default healthRouter;
