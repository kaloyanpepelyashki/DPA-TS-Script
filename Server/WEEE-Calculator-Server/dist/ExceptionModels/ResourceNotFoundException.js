"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResourceNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, ResourceNotFound);
    }
}
exports.default = ResourceNotFound;
//# sourceMappingURL=ResourceNotFoundException.js.map