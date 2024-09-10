"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ShopifyClient_1 = __importDefault(require("../ServiceLayer/ShopifyClient"));
class OrdersGraphDAO extends ShopifyClient_1.default {
    constructor(accessToken, hostName) {
        super(accessToken, hostName);
        this.graphQlClient = new this.shopify.clients.Graphql({
            session: this.session,
        });
    }
    //TODO Test if this method works as expected
    getOrdersCountFor(fromDate, toDate, country) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.graphQlClient.request(`query ($country: String!, $minDate: DateTime, $maxDate: DateTime) {
          orders(query: "financial_status:paid, created_at:>= $minDate, created_at:<= $maxDate, shipping_address.country: $country") {
            edges {
              node {
                id
              }
            }
          }
        }
      `, {
                    variables: {
                        country: country,
                        minDate: fromDate,
                        maxDate: toDate,
                    },
                    retries: 2,
                });
                if (response.body.data.orders.edges.length > 0) {
                    return {
                        isSuccess: true,
                        count: response.body.data.orders.edges.length,
                    };
                }
                return { isSuccess: false, count: 0 };
            }
            catch (e) {
                console.log(`Error in OrdersGraphDAO, error getting orders count: ${e}`);
                throw e;
            }
        });
    }
}
exports.default = OrdersGraphDAO;
//# sourceMappingURL=OrdersGraphDAO.js.map