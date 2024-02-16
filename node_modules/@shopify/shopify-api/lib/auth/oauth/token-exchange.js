"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenExchange = exports.RequestedTokenType = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../../clients/common");
const decode_session_token_1 = require("../../session/decode-session-token");
const shop_validator_1 = require("../../utils/shop-validator");
const runtime_1 = require("../../../runtime");
const types_1 = require("../../clients/types");
const create_session_1 = require("./create-session");
var RequestedTokenType;
(function (RequestedTokenType) {
    RequestedTokenType["OnlineAccessToken"] = "urn:shopify:params:oauth:token-type:online-access-token";
    RequestedTokenType["OfflineAccessToken"] = "urn:shopify:params:oauth:token-type:offline-access-token";
})(RequestedTokenType || (exports.RequestedTokenType = RequestedTokenType = {}));
const TokenExchangeGrantType = 'urn:ietf:params:oauth:grant-type:token-exchange';
const IdTokenType = 'urn:ietf:params:oauth:token-type:id_token';
function tokenExchange(config) {
    return ({ shop, sessionToken, requestedTokenType, }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield (0, decode_session_token_1.decodeSessionToken)(config)(sessionToken);
        const body = {
            client_id: config.apiKey,
            client_secret: config.apiSecretKey,
            grant_type: TokenExchangeGrantType,
            subject_token: sessionToken,
            subject_token_type: IdTokenType,
            requested_token_type: requestedTokenType,
        };
        const cleanShop = (0, shop_validator_1.sanitizeShop)(config)(shop, true);
        const postResponse = yield (0, runtime_1.abstractFetch)(`https://${cleanShop}/admin/oauth/access_token`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': types_1.DataType.JSON,
                Accept: types_1.DataType.JSON,
            },
        });
        if (!postResponse.ok) {
            (0, common_1.throwFailedRequest)(yield postResponse.json(), postResponse, false);
        }
        return {
            session: (0, create_session_1.createSession)({
                accessTokenResponse: yield postResponse.json(),
                shop: cleanShop,
                // We need to keep this as an empty string as our template DB schemas have this required
                state: '',
                config,
            }),
        };
    });
}
exports.tokenExchange = tokenExchange;
//# sourceMappingURL=token-exchange.js.map