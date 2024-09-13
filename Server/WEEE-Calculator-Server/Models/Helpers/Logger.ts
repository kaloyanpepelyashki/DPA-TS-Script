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
  console.error(`Error at ${route}. ${error}. Request IP: ${req.ip}`, {
    timestamp: new Date().toISOString(),
    route,
    method: req.method,
    ip: req.ip,
    url: req.url,
    headers: req.headers["user-agent"],
    status: statusCode,
    errorMessage: error.message || error,
    stack: error.stack || null,
  });
};
