"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifyUtils = void 0;
const shop_validator_1 = require("./shop-validator");
const hmac_validator_1 = require("./hmac-validator");
const version_compatible_1 = require("./version-compatible");
const shop_admin_url_helper_1 = require("./shop-admin-url-helper");
function shopifyUtils(config) {
    return {
        sanitizeShop: (0, shop_validator_1.sanitizeShop)(config),
        sanitizeHost: (0, shop_validator_1.sanitizeHost)(),
        validateHmac: (0, hmac_validator_1.validateHmac)(config),
        versionCompatible: (0, version_compatible_1.versionCompatible)(config),
        versionPriorTo: (0, version_compatible_1.versionPriorTo)(config),
        shopAdminUrlToLegacyUrl: shop_admin_url_helper_1.shopAdminUrlToLegacyUrl,
        legacyUrlToShopAdminUrl: shop_admin_url_helper_1.legacyUrlToShopAdminUrl,
    };
}
exports.shopifyUtils = shopifyUtils;
//# sourceMappingURL=index.js.map