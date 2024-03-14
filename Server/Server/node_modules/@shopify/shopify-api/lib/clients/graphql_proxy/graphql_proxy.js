"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlProxy = void 0;
const tslib_1 = require("tslib");
const ShopifyErrors = tslib_1.__importStar(require("../../error"));
const admin_1 = require("../admin");
function graphqlProxy(config) {
    return ({ session, rawBody }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!session.accessToken) {
            throw new ShopifyErrors.InvalidSession('Cannot proxy query. Session not authenticated.');
        }
        const GraphqlClient = (0, admin_1.graphqlClientClass)({ config });
        const client = new GraphqlClient({ session });
        let query;
        let variables;
        if (typeof rawBody === 'string') {
            query = rawBody;
        }
        else {
            query = rawBody.query;
            variables = rawBody.variables;
        }
        if (!query) {
            throw new ShopifyErrors.MissingRequiredArgument('Query missing.');
        }
        const response = yield client.request(query, { variables });
        return { body: response, headers: {} };
    });
}
exports.graphqlProxy = graphqlProxy;
//# sourceMappingURL=graphql_proxy.js.map