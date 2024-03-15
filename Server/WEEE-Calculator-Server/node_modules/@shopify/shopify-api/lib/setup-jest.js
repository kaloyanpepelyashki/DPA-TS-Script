"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compare_versions_1 = require("compare-versions");
require("../adapters/mock");
const version_1 = require("./version");
const __test_helpers__1 = require("./__test-helpers__");
expect.extend({
    toMatchMadeHttpRequest: __test_helpers__1.toMatchMadeHttpRequest,
    /**
     * Checks if two dates in the form of numbers are within seconds of each other
     *
     * @param received First date
     * @param compareDate Second date
     * @param seconds The number of seconds the first and second date should be within
     */
    toBeWithinSecondsOf(received, compareDate, seconds) {
        if (received &&
            compareDate &&
            Math.abs(received - compareDate) <= seconds * 1000) {
            return {
                message: () => `expected ${received} not to be within ${seconds} seconds of ${compareDate}`,
                pass: true,
            };
        }
        else {
            return {
                message: () => `expected ${received} to be within ${seconds} seconds of ${compareDate}`,
                pass: false,
            };
        }
    },
    toBeWithinDeprecationSchedule(version) {
        return {
            message: () => `Found deprecation limited to version ${version}, please update or remove it.`,
            pass: (0, compare_versions_1.compare)(version_1.SHOPIFY_API_LIBRARY_VERSION, version, '<'),
        };
    },
});
//# sourceMappingURL=setup-jest.js.map