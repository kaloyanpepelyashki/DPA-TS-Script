"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This class encapsulates helper utilities to simplify development complexity and increase code readability and maintainability
 */
class RequestUtils {
    /**
     * This method's primary purpose is to extract headers from the request object
     * @param {Request} req the express reqest object
     * @returns the extracted accessToken and hostName headers from the request object
     */
    static extractHeaders(req) {
        const accessToken = req.headers["access-token"];
        const hostName = req.headers["host-name"];
        return { accessToken, hostName };
    }
}
exports.default = RequestUtils;
//# sourceMappingURL=RequestUtils%20.js.map