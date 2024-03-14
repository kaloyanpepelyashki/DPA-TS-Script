"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientClasses = void 0;
const admin_1 = require("./admin");
const storefront_1 = require("./storefront");
const graphql_proxy_1 = require("./graphql_proxy/graphql_proxy");
function clientClasses(config) {
    return {
        // We don't pass in the HttpClient because the RestClient inherits from it, and goes through the same setup process
        Rest: (0, admin_1.restClientClass)({ config }),
        Graphql: (0, admin_1.graphqlClientClass)({ config }),
        Storefront: (0, storefront_1.storefrontClientClass)({ config }),
        graphqlProxy: (0, graphql_proxy_1.graphqlProxy)(config),
    };
}
exports.clientClasses = clientClasses;
//# sourceMappingURL=index.js.map