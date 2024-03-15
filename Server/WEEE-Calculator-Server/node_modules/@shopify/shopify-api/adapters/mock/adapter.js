"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRuntimeString = exports.mockFetch = exports.mockConvertHeaders = exports.mockConvertResponse = exports.mockConvertRequest = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = require("node-fetch");
const http_1 = require("../../runtime/http");
const mock_test_requests_1 = require("./mock_test_requests");
function mockConvertRequest(adapterArgs) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return Promise.resolve(adapterArgs.rawRequest);
    });
}
exports.mockConvertRequest = mockConvertRequest;
function mockConvertResponse(response, _adapterArgs) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return Promise.resolve(response);
    });
}
exports.mockConvertResponse = mockConvertResponse;
function mockConvertHeaders(headers, _adapterArgs) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return Promise.resolve(headers);
    });
}
exports.mockConvertHeaders = mockConvertHeaders;
const mockFetch = (url, init) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const mockInit = init;
    const request = new node_fetch_1.Request(url, mockInit);
    const headers = Object.fromEntries(new node_fetch_1.Headers(mockInit === null || mockInit === void 0 ? void 0 : mockInit.headers).entries());
    mock_test_requests_1.mockTestRequests.requestList.push({
        url: request.url,
        method: request.method,
        headers: (0, http_1.canonicalizeHeaders)(headers),
        body: yield request.text(),
    });
    const next = mock_test_requests_1.mockTestRequests.responseList.shift();
    if (!next) {
        throw new Error(`Missing mock for ${request.method} to ${url}, have you queued all required responses?`);
    }
    if (next instanceof Error) {
        throw next;
    }
    const responseHeaders = new node_fetch_1.Headers();
    Object.entries((_a = next.headers) !== null && _a !== void 0 ? _a : {}).forEach(([key, value]) => {
        responseHeaders.set(key, typeof value === 'string' ? value : value.join(', '));
    });
    return new node_fetch_1.Response(next.body, {
        status: next.statusCode,
        statusText: next.statusText,
        headers: responseHeaders,
    });
});
exports.mockFetch = mockFetch;
function mockRuntimeString() {
    return 'Mock adapter';
}
exports.mockRuntimeString = mockRuntimeString;
//# sourceMappingURL=adapter.js.map