"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptions = void 0;
const tslib_1 = require("tslib");
const error_1 = require("../error");
const admin_1 = require("../clients/admin");
const SUBSCRIPTION_QUERY = `
  query appSubscription {
    currentAppInstallation {
      activeSubscriptions {
        id
        name
        test
      }
  }
}
`;
function subscriptions(config) {
    return function ({ session, }) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!config.billing) {
                throw new error_1.BillingError({
                    message: 'Attempted to look for purchases without billing configs',
                    errorData: [],
                });
            }
            const GraphqlClient = (0, admin_1.graphqlClientClass)({ config });
            const client = new GraphqlClient({ session });
            const response = yield client.request(SUBSCRIPTION_QUERY);
            return (_a = response.data) === null || _a === void 0 ? void 0 : _a.currentAppInstallation;
        });
    };
}
exports.subscriptions = subscriptions;
//# sourceMappingURL=subscriptions.js.map