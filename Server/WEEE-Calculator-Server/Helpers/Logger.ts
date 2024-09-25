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
    `!!!=============!!! \nError at ${route}. ${error}. Request IP: ${req.ip}`,
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
  console.error(`!!!=============!!! \n Error`, {
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
  console.info(`------------- \nSuccessful action at ${route}. ${message}`, {
    timestamp: new Date().toISOString(),
    route,
    method: req.method,
    ip: req.ip,
    url: req.url,
    headers: req.headers["user-agent"],
    status: statusCode,
    message: message,
  });
};
