import { Request } from "express";

export const routeErrorLogger: (
  route: string,
  req: Request,
  error: any,
  statusCode: number
) => void = (
  route: string,
  req: Request,
  error: any,
  statusCode: number = 500
) => {
  console.error(
    `!!!=============!!! \n !>Error: At ${route}. ${error}. Request IP: ${req.ip} \n`,
    {
      timestamp: new Date().toISOString(),
      route,
      method: req.method,
      ip: req.ip,
      url: req.url,
      headers: req.headers["user-agent"],
      status: statusCode,
      errorMessage: error.message || error,
      stack: error.stack || null,
    }
  );
};

export const errorLogger: (error: any) => void = (error: any) => {
  console.error(`!!!=============!!! \n !>Error: `, {
    timestamp: new Date().toISOString(),
    errorMessage: error.message || error,
    stack: error.stack || null,
  });
};

export const routeResponseLogger: (
  route: string,
  req: Request,
  message: string,
  statusCode: number
) => void = (
  route: string,
  req: Request,
  message: string,
  statusCode: number
) => {
  console.info(
    `------------- \n >Log: Successful action at ${route}. ${message} \n`,
    {
      timestamp: new Date().toISOString(),
      route,
      method: req.method,
      ip: req.ip,
      url: req.url,
      headers: req.headers["user-agent"],
      status: statusCode,
      message: message,
    }
  );
};

/**
 * A generic log method. The method logs the message passed to the console.
 * The method returns a console log with time stamp.
 * @param message the message string to be logged in the console.
 * @returns void
 */
export const generalLog: (message: string) => void = (message: string) => {
  if (message.length > 0) {
    console.log(`----------- \n >Log: ${message} \n`, {
      timestamp: new Date().toISOString(),
    });
  }

  return;
};
