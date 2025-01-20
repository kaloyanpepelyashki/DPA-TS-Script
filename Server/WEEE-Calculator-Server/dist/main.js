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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const webhooksRouter_1 = __importDefault(require("./Routes/webhooksRouter"));
const CollectionsManager_1 = __importDefault(require("./ServiceLayer/Services/CollectionsManager"));
const ProductsManager_1 = __importDefault(require("./ServiceLayer/Services/ProductsManager"));
const CollectionsCalculator_1 = __importDefault(require("./ServiceLayer/Services/CollectionsCalculator"));
//DAO Factory
const DaoFactory_1 = __importDefault(require("./Factory/DaoFactory"));
//Utilities Imports
const RequestUtils_1 = __importDefault(require("./Utilities/RequestUtils "));
const CollectionsProductService_1 = __importDefault(require("./ServiceLayer/Services/CollectionsProductService"));
const ResourceNotFoundException_1 = __importDefault(require("./ExceptionModels/ResourceNotFoundException"));
const OrdersManager_1 = __importDefault(require("./ServiceLayer/Services/OrdersManager"));
const Logger_1 = require("./Helpers/Logger");
const HealthRouter_1 = __importDefault(require("./Routes/HealthRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const https = require("https");
const fs = require("fs");
app.use(express_1.default.json());
const environment = process.env.ENVIRONMENT;
const port = process.env.PORT || 4000;
if (environment == "PRODUCTION") {
    try {
        // Load SSL certificate and key
        const options = {
            key: fs.readFileSync("/etc/letsencrypt/live/api.weee-calculator.net.ohmio.net/privkey.pem"),
            cert: fs.readFileSync("/etc/letsencrypt/live/api.weee-calculator.net.ohmio.net/fullchain.pem"),
        };
        // Create HTTPS server
        https.createServer(options, app).listen(port, () => {
            console.log("Server is running securely on https://api.weee-calcualtor.net.ohmio.net. Port: ", port);
        });
    }
    catch (e) {
        (0, Logger_1.errorLogger)(e);
    }
}
else {
    app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`App is running on ${port}`);
    }));
}
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "access-token", "host-name"],
    credentials: true,
}));
app.options("*", (0, cors_1.default)());
app.use((req, res, next) => {
    console.log({
        ip: req.ip,
        method: req.method,
        url: req.url,
        headers: req.headers["user-agent"],
        query: req.query,
        params: req.params,
    });
    next();
});
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on("finish", () => {
        const elapsedTime = Date.now() - startTime;
        console.log({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${elapsedTime}ms`,
            ip: req.ip,
        });
    });
    next();
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    console.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        status: res.statusCode,
        ip: req.ip,
    });
    res.status(500).send("Something went wrong! Internal server error");
});
//========= Health check routes ======== //
app.use("/health", HealthRouter_1.default);
//========= Web hook routes ======== //
app.use("/gdpr-compliance/webhooks", webhooksRouter_1.default);
app.post("/api/v1/initCalculation", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const route = "/initCalculation";
    try {
        console.log("============= \n/initCalculation requested by: ip ", req.ip);
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            (0, Logger_1.routeErrorLogger)(route, req, "Missing headers", 400);
            res.status(400).send("Missing headers");
            return;
        }
        const collectionTitles = req.body.collectionTitles;
        //The start and end date of the period the report is being generated for
        const reportFromDate = req.body.fromDate || null;
        const reportToDate = req.body.toDate || null;
        //The country the report is being generated for
        const reportCountry = req.body.targetCountry || null;
        if (collectionTitles != null &&
            collectionTitles.length > 0 &&
            collectionTitles != null &&
            reportCountry != null) {
            console.log("Report requested");
            const daoFactory = new DaoFactory_1.default(accessToken, hostName);
            const ordersDao = daoFactory.getDAO("ordersDao");
            const ordersGraphDao = daoFactory.getDAO("ordersGraphDao");
            const collectionsRestDao = daoFactory.getDAO("collectionsRestDao");
            const collectionsGraphDao = daoFactory.getDAO("collectionsGraphDao");
            const ordersManager = new OrdersManager_1.default(ordersDao, ordersGraphDao);
            const collectionsCalculator = new CollectionsCalculator_1.default(ordersManager, collectionsRestDao, collectionsGraphDao);
            const collectionsTotalWeights = yield collectionsCalculator.calculateCollectionsTotalWeight(collectionTitles, reportFromDate, reportToDate, reportCountry);
            //Gets the vendor's store orders count for the specified period
            const shopOrdersCount = yield ordersManager.getShopOrdersCountFor(reportFromDate, reportToDate, reportCountry);
            if (shopOrdersCount.error || collectionsTotalWeights.error) {
                (0, Logger_1.routeErrorLogger)(route, req, (_a = shopOrdersCount.error) !== null && _a !== void 0 ? _a : collectionsTotalWeights.error, 500);
                res.status(500).send(`Internal server error`);
                return;
            }
            if (shopOrdersCount.isSuccess && collectionsTotalWeights.isSuccess) {
                (0, Logger_1.routeResponseLogger)(route, req, "Calculation successful, report sent", 200);
                return res.status(200).send(JSON.stringify({
                    totalWeights: Object.fromEntries(collectionsTotalWeights.collectionsTotalWeights),
                    ordersCount: shopOrdersCount.count,
                }));
            }
        }
        else {
            (0, Logger_1.routeErrorLogger)(route, req, "Missing parameters", 400);
            res.status(400).send("Missing parameters");
            return;
        }
    }
    catch (e) {
        (0, Logger_1.routeErrorLogger)(route, req, "Internal server error", 500);
        res.status(500).send(`Internal server error`);
        return;
    }
}));
/**
 * This route is designated for creating collections
 * The route expects headers with string accessToken and string hostName
 * The rout expects to get an array of Maps containing collection title as key and collection description as value:
 * [
      {
        'collectionTitle': "collectionDescription"
      },
      {
        'collectionTitle': "collectionDescription"
      },
    ]
 */
app.post("/api/v1/createCollection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const route = "/createCollection";
    try {
        console.log("============= \n/createCollection requested by: ip ", req.ip);
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            (0, Logger_1.routeErrorLogger)(route, req, "Missing headers", 400);
            res.status(400).send("Missing headers");
            return;
        }
        const collections = req.body;
        console.log("collections received: ", collections);
        const collectionsMapsArray = collections.map((obj) => new Map(Object.entries(obj)));
        //Initialising the DAO factory class
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        const collectionsRestDao = daoFactory.getDAO("collectionsRestDao");
        const collectionsGraphDao = daoFactory.getDAO("collectionsGraphDao");
        //initialising the collectionsManager class
        const collectionsManager = new CollectionsManager_1.default(collectionsGraphDao, collectionsRestDao);
        const result = yield collectionsManager.createCollectionsFor(collectionsMapsArray);
        if (result.error) {
            (0, Logger_1.routeErrorLogger)(route, req, result.error, 500);
            res.status(500).send("Error creating collections. Internal server error");
            return;
        }
        if (result.isSuccess) {
            (0, Logger_1.routeResponseLogger)(route, req, "Collections created successfully", 201);
            res.status(201).send("Collections created");
            return;
        }
        else {
            (0, Logger_1.routeErrorLogger)(route, req, result.error ? result.error : "Action unsuccessful", 500);
            res.status(500).send("Error creating collections");
            return;
        }
    }
    catch (e) {
        (0, Logger_1.routeErrorLogger)(route, req, "Internal server error", 500);
        res.status(500).send(`Internal server error`);
        return;
    }
}));
/**
 * This route is designated for getting all WEEE collections from vendor's store
 * The route expects headers with string accessToken and string hostName
 */
app.get("/api/v1/weeeCollections/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const route = "/weeeCollections/all";
    try {
        console.log("============= \n/weeeCollecations/all requested by: IP ", req.ip);
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            (0, Logger_1.routeErrorLogger)(route, req, "Missing headers", 400);
            res.status(400).send("Missing headers");
            return;
        }
        //Initialising the DAO factory class
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        //Getting the needed DAOs
        const collectionsRestDao = daoFactory.getDAO("collectionsRestDao");
        const collectionsGraphDao = daoFactory.getDAO("collectionsGraphDao");
        //initialising the collectionsManager class
        const collectionsManager = new CollectionsManager_1.default(collectionsGraphDao, collectionsRestDao);
        const result = yield collectionsManager.getWeeeCollections();
        if (result.error) {
            (0, Logger_1.routeErrorLogger)(route, req, result.error, 500);
            res
                .status(500)
                .send(`Error getting weee collections. Internal server error`);
            return;
        }
        if (result.isSuccess) {
            if (result.collections && result.collections.length <= 0) {
                (0, Logger_1.routeResponseLogger)(route, req, "No WEEE collections found in vendor's store", 404);
                res.status(404).send("No WEEE collections found");
                return;
            }
            (0, Logger_1.routeResponseLogger)(route, req, "WEEE collections retreived successfully", 200);
            res.status(200).send(JSON.stringify(result.collections));
            return;
        }
        (0, Logger_1.routeErrorLogger)(route, req, "Internal server error", 500);
        res
            .status(500)
            .send(`Error getting all weee collections. Internal server error`);
        return;
    }
    catch (e) {
        (0, Logger_1.routeErrorLogger)(route, req, e, 500);
        res
            .status(500)
            .send(`Error getting all weee collections. Internal server error`);
        return;
    }
}));
/**
 * This route is designated for getting all products belonging to a  collection
 * The route expects headers with string accessToken and string hostName
 * The route expects to get a collection id url parameter. The parameter is the id of the collection which products need to be fetched.
 */
app.get("/api/v1/collection/:id/products/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const route = "/collection/:id/products/all";
    try {
        console.log("============= \n/collection/:id/products/all requested by: IP ", req.ip);
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        const collectionId = Number(req.params.id);
        if (!accessToken || !hostName) {
            (0, Logger_1.routeErrorLogger)(route, req, "Missing headers", 400);
            res.status(400).send("Missing headers");
            return;
        }
        //Initialising the DAO factory class
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        //Getting the needed DAOs
        const productsDAO = daoFactory.getDAO("productsDao");
        //initialising the collectionsManager class
        const productsManager = new ProductsManager_1.default(productsDAO);
        const result = yield productsManager.getProductsForCollection(collectionId);
        if (result.error) {
            (0, Logger_1.routeErrorLogger)(route, req, result.error, 500);
            //Returns 500 if error occured
            res
                .status(500)
                .send("Error getting collections's all products. Internal server error");
        }
        if (result.isSuccess) {
            if (result.products.length == 0) {
                //Still successful operation, but no products found
                (0, Logger_1.routeResponseLogger)(route, req, `No products were found that belong to collection ${collectionId} in vendors store.`, 404);
                res
                    .status(404)
                    .send(`No products were found that belong to collection ${collectionId} in vendors store.`);
                return;
            }
            (0, Logger_1.routeResponseLogger)(route, req, "Collection products retreived successfully", 200);
            res.status(200).send(result.products);
            return;
        }
        (0, Logger_1.routeErrorLogger)(route, req, "Internal server error", 500);
        //Returns 500 if error occured
        res
            .status(500)
            .send("Error getting collections's all products. Internal server error");
    }
    catch (e) {
        (0, Logger_1.routeErrorLogger)(route, req, e, 500);
        res
            .status(500)
            .send(`Error getting collections's all products. Internal server error`);
        return;
    }
}));
/**
 * This route is designated for getting all products
 * The route expects headers with string accessToken and string hostName
 * The route sends back an array of product objects
 */
app.get("/api/v1/products/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const route = "/api/v1/products/all";
    try {
        console.log("============= \n/products/all  requested by: IP ", req.ip);
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            (0, Logger_1.routeErrorLogger)(route, req, "Missing headers", 400);
            res.status(400).send("Missing headers");
            return;
        }
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        const productsDao = daoFactory.getDAO("productsDao");
        const productManager = new ProductsManager_1.default(productsDao);
        const result = yield productManager.getAllActiveProducts();
        if (result.error) {
            (0, Logger_1.routeErrorLogger)(route, req, result.error, 500);
            res.status(500).send("Error getting all products. Internal server error");
            return;
        }
        if (result.isSuccess) {
            if (result.products.length == 0) {
                (0, Logger_1.routeResponseLogger)(route, req, `No products were found in vendors store.`, 404);
                res.status(404).send("No products were found in vendors store.");
                return;
            }
            (0, Logger_1.routeResponseLogger)(route, req, "All products retreived successfully", 200);
            res.status(200).send(result.products);
            return;
        }
        else {
            (0, Logger_1.routeErrorLogger)(route, req, "Internal server error", 500);
            res.status(500).send("Error getting all products. Internal server error");
            return;
        }
    }
    catch (e) {
        (0, Logger_1.routeErrorLogger)(route, req, e, 500);
        res.status(500).send(`Error getting all products. Internal server error`);
        return;
    }
}));
/**
 * This route is designated for adding products to a collection
 * The route expects headers with string accessToken and string hostName, and a JSON body with:
 * {
 *   "collection": "collectionId",
 *   "products": ["productId", "productId", ...]
 * }
 * collection is the collection id of the collection that products will be added to
 * products is an array of product ids that will be added to the collection
 */
app.post("/api/v1/addProductsToCollection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const route = "/addProductsToCollection";
    try {
        console.log("============= \n/addProductsToCollection  requested by: IP ", req.ip);
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            (0, Logger_1.routeErrorLogger)(route, req, "Missing headers", 400);
            res.status(400).send({ message: "Missing headers" });
            return;
        }
        const collectionId = req.body.collection;
        const products = req.body.products;
        if (typeof collectionId !== "string" || !Array.isArray(products)) {
            (0, Logger_1.routeErrorLogger)(route, req, "Parameters of wrong type", 400);
            res.status(400).send({ message: "Prameters are not of correct type" });
            return;
        }
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        const collectionsRestDao = daoFactory.getDAO("collectionsRestDao");
        const collectionsGraphDao = daoFactory.getDAO("collectionsGraphDao");
        const collectionsProductService = new CollectionsProductService_1.default(collectionsGraphDao, collectionsRestDao);
        const result = yield collectionsProductService.addProductsToCollection(collectionId, products);
        if (result.error) {
            (0, Logger_1.routeErrorLogger)(route, req, result.error, 500);
            res
                .status(500)
                .send("Error adding products to collection. Internal server error");
            return;
        }
        if (result.isSuccess) {
            (0, Logger_1.routeResponseLogger)(route, req, "Products added successfully", 200);
            res
                .status(200)
                .send({ message: "Products successfully added to collecton" });
            return;
        }
        else {
            (0, Logger_1.routeErrorLogger)(route, req, "Internal server error", 500);
            res
                .status(500)
                .send({ message: "Error adding products to collection" });
            return;
        }
    }
    catch (err) {
        if (err instanceof ResourceNotFoundException_1.default) {
            (0, Logger_1.routeErrorLogger)(route, req, err, 400);
            res.status(400).send(err);
            return;
        }
        else {
            (0, Logger_1.routeErrorLogger)(route, req, err, 500);
            res
                .status(500)
                .send(`Error adding products to collection. Internal server error`);
            return;
        }
    }
}));
/**
 * This route is designated for adding products to a collection
 * The route expects headers with string accessToken and string hostName, and a JSON body with:
 * {
 *   "collection": "collectionId",
 *   "products": ["productId", "productId", ...]
 * }
 * collection is the collection id of the collection that products will be removed from
 * products is an array of product ids that will be removed from the collection
 */
app.post("/api/v1/removeProductsFromCollection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const route = "/removeProductsFromCollection";
    try {
        console.log("============= \n/removeProductsFromCollection  requested by: IP ", req.ip);
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            (0, Logger_1.routeErrorLogger)(route, req, "Missing headers", 500);
            res.status(400).send("Missing headers");
            return;
        }
        const collectionId = req.body.collection;
        const products = req.body.products;
        if (typeof collectionId !== "string" || !Array.isArray(products)) {
            (0, Logger_1.routeErrorLogger)(route, req, "Parameters of wrong type", 500);
            res.status(400).send("Prameters are not of correct type");
            return;
        }
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        const collectionsRestDao = daoFactory.getDAO("collectionsRestDao");
        const collectionsGraphDao = daoFactory.getDAO("collectionsGraphDao");
        const collectionsProductService = new CollectionsProductService_1.default(collectionsGraphDao, collectionsRestDao);
        const result = yield collectionsProductService.removeProductsFromCollection(collectionId, products);
        if (result.error) {
            (0, Logger_1.routeErrorLogger)(route, req, result.error, 500);
            res.status(500).send("Error removing products. Internal server error");
            return;
        }
        if (result.isSuccess) {
            (0, Logger_1.routeResponseLogger)(route, req, "Products removed successfully", 200);
            res
                .status(200)
                .send({ message: "Products successfully removed from collecton" });
            return;
        }
        else {
            (0, Logger_1.routeErrorLogger)(route, req, "Internal server error", 500);
            res
                .status(500)
                .send({ message: "Error removing products from collection" });
            return;
        }
    }
    catch (err) {
        if (err instanceof ResourceNotFoundException_1.default) {
            res.status(400).send(err);
            return;
        }
        else {
            (0, Logger_1.routeErrorLogger)(route, req, err, 500);
            res
                .status(500)
                .send(`Error removing products from collection. Internal server error`);
            return;
        }
    }
}));
app.get("/api/v1/health", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("============= \nHealth check was requested by ip: ", req.ip);
    res.status(200).send("App is healthy");
}));
//# sourceMappingURL=main.js.map