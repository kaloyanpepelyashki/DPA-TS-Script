import { Request } from "express";

type extractedHeaders = {
  accessToken: string | undefined;
  hostName: string | undefined;
};

/**
 * This class encapsulates helper utilities to simplify development complexity and increase code readability and maintainability
 */
class RequestUtils {
  /**
   * This method's primary purpose is to extract headers from the request object
   * @param {Request} req the express reqest object
   * @returns the extracted accessToken and hostName headers from the request object
   */
  public static extractHeaders(req: Request): extractedHeaders {
    const accessToken: string | undefined = req.headers[
      "access-token"
    ] as string;

    const hostName: string | undefined = req.headers["host-name"] as
      | string
      | undefined;

    return { accessToken, hostName };
  }
}

export default RequestUtils;
