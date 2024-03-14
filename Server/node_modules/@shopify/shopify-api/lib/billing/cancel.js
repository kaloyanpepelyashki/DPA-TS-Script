"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancel = void 0;
const tslib_1 = require("tslib");
const admin_1 = require("../clients/admin");
const error_1 = require("../error");
const CANCEL_MUTATION = `
  mutation appSubscriptionCancel($id: ID!, $prorate: Boolean) {
    appSubscriptionCancel(id: $id, prorate: $prorate) {
      appSubscription {
        id
        name
        test
      }
      userErrors {
        field
        message
      }
    }
  }
`;
function cancel(config) {
    return function (subscriptionInfo) {
        var _a, _b, _c, _d, _e, _f, _g;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { session, subscriptionId, prorate = true } = subscriptionInfo;
            const GraphqlClient = (0, admin_1.graphqlClientClass)({ config });
            const client = new GraphqlClient({ session });
            try {
                const response = yield client.request(CANCEL_MUTATION, {
                    variables: { id: subscriptionId, prorate },
                });
                if ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.appSubscriptionCancel) === null || _b === void 0 ? void 0 : _b.userErrors.length) {
                    throw new error_1.BillingError({
                        message: 'Error while canceling a subscription',
                        errorData: (_d = (_c = response.data) === null || _c === void 0 ? void 0 : _c.appSubscriptionCancel) === null || _d === void 0 ? void 0 : _d.userErrors,
                    });
                }
                return (_f = (_e = response.data) === null || _e === void 0 ? void 0 : _e.appSubscriptionCancel) === null || _f === void 0 ? void 0 : _f.appSubscription;
            }
            catch (error) {
                if (error instanceof error_1.GraphqlQueryError) {
                    throw new error_1.BillingError({
                        message: error.message,
                        errorData: (_g = error.response) === null || _g === void 0 ? void 0 : _g.errors,
                    });
                }
                else {
                    throw error;
                }
            }
        });
    };
}
exports.cancel = cancel;
//# sourceMappingURL=cancel.js.map