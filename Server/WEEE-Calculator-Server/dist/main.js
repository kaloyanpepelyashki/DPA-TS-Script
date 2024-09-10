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
const CollectionsManager_1 = __importDefault(require("./ServiceLayer/Services/CollectionsManager"));
const ProductsManager_1 = __importDefault(require("./ServiceLayer/Services/ProductsManager"));
const CollectionsCalculator_1 = __importDefault(require("./ServiceLayer/Services/CollectionsCalculator"));
const DaoFactory_1 = __importDefault(require("./Factory/DaoFactory"));
//Utilities Imports
const RequestUtils_1 = __importDefault(require("./Utilities/RequestUtils "));
const CollectionsProductService_1 = __importDefault(require("./ServiceLayer/Services/CollectionsProductService"));
const ResourceNotFoundException_1 = __importDefault(require("./ExceptionModels/ResourceNotFoundException"));
const OrdersManager_1 = __importDefault(require("./ServiceLayer/Services/OrdersManager"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong! Internal server error");
});
const port = 4000;
//TODO Modify the neccessary methods to also require country the report is being exporeted for
app.post("/api/v1/initCalculation", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Request in /initCalculation received");
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            res.status(400).send("Missing headers");
            console.log("Error, missing headers");
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
                console.log("Internal server error when genrating report");
                return res.status(500).send(`Internal server error`);
            }
            if (shopOrdersCount.isSuccess && collectionsTotalWeights.isSuccess) {
                console.log("Report sent");
                return res.status(200).send(JSON.stringify({
                    totalWeights: Object.fromEntries(collectionsTotalWeights.collectionsTotalWeights),
                    ordersCount: shopOrdersCount.count,
                }));
            }
        }
        else {
            console.log("Error, missing parameters");
            return res.status(400).send("Missing parameters");
        }
    }
    catch (e) {
        console.log("Internal server error when genrating report");
        return res.status(500).send(`Internal server error`);
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
    try {
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
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
            console.log("Error creating collections", result.error);
            res.status(500).send("Error creating collections. Internal server error");
            return;
        }
        if (result.isSuccess) {
            res.status(201).send("Collections created");
            return;
        }
        else {
            res.status(500).send("Error creating collections");
            console.log("Error creating collections", result.error);
            return;
        }
    }
    catch (e) {
        console.log("Error creating collections", e);
        res.status(500).send(`Internal server error`);
        return;
    }
}));
/**
 * This route is designated for getting all WEEE collections from vendor's store
 * The route expects headers with string accessToken and string hostName
 */
app.get("/api/v1/weeeCollections/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("weeeCollections/all is called");
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            res.status(400).send("Missing headers");
            console.log("Error, missing headers");
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
            console.log("Error getting all weee collections: ", result.error);
            res
                .status(500)
                .send(`Error getting weee collections. Internal server error`);
            return;
        }
        if (result.isSuccess) {
            if (result.collections && result.collections.length <= 0) {
                console.log("No WEEE collections found");
                res.status(404).send("No WEEE collections found");
                return;
            }
            console.log("Wee collections retreived successfully");
            res.status(200).send(JSON.stringify(result.collections));
            return;
        }
        res
            .status(500)
            .send(`Error getting all weee collections. Internal server error`);
        return;
    }
    catch (e) {
        console.log("Error getting all weee collections: ", e);
        res
            .status(500)
            .send(`Error getting all weee collections. Internal server error`);
        return;
    }
}));
/**
 * This route is designated for getting all products belonging to a collection
 * The route expects headers with string accessToken and string hostName
 * The route expects to get a collection id url parameter. The parameter is the id of the collection which products need to be fetched.
 */
app.get("/api/v1/collection/:id/products/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        const collectionId = Number(req.params.id);
        if (!accessToken || !hostName) {
            console.log("Error, missing headers");
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
            console.log("Error getting products for collection: ", result.error);
            //Returns 500 if error occured
            res
                .status(500)
                .send("Error getting collections's all products. Internal server error");
        }
        if (result.isSuccess) {
            if (result.products.length == 0) {
                //Still successful operation, but no products found
                res
                    .status(404)
                    .send(`No products were found that belong to collection ${collectionId} in vendors store.`);
                return;
            }
            res.status(200).send(result.products);
            return;
        }
    }
    catch (e) {
        console.log("Error getting products for collection: ", e.message);
        res
            .sendStatus(500)
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
    try {
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            res.status(400).send("Missing headers");
            console.log("Error, missing headers");
            return;
        }
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        const productsDao = daoFactory.getDAO("productsDao");
        const productManager = new ProductsManager_1.default(productsDao);
        const result = yield productManager.getAllActiveProducts();
        if (result.error) {
            res.status(500).send("Error getting all products. Internal server error");
            return;
        }
        if (result.isSuccess) {
            if (result.products.length == 0) {
                res.status(404).send("No products were found in vendors store.");
                return;
            }
            res.status(200).send(result.products);
            return;
        }
        else {
            res.status(500).send("Error getting all products. Internal server error");
            return;
        }
    }
    catch (e) {
        console.log("Error getting all products", e);
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
    try {
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            res.status(400).send({ message: "Missing headers" });
            return;
        }
        const collectionId = req.body.collection;
        const products = req.body.products;
        if (typeof collectionId !== "string" || !Array.isArray(products)) {
            res.status(400).send({ message: "Prameters are not of correct type" });
            return;
        }
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        const collectionsRestDao = daoFactory.getDAO("collectionsRestDao");
        const collectionsGraphDao = daoFactory.getDAO("collectionsGraphDao");
        const collectionsProductService = new CollectionsProductService_1.default(collectionsGraphDao, collectionsRestDao);
        const result = yield collectionsProductService.addProductsToCollection(collectionId, products);
        if (result.error) {
            res
                .status(500)
                .send("Error adding products to collection. Internal server error");
            return;
        }
        if (result.isSuccess) {
            res
                .status(200)
                .send({ message: "Products successfully added to collecton" });
            return;
        }
        else {
            res
                .status(500)
                .send({ message: "Error adding products to collection" });
            return;
        }
    }
    catch (err) {
        if (err instanceof ResourceNotFoundException_1.default) {
            res.status(400).send(err);
            return;
        }
        else {
            console.log("Error adding productrs to collection.", err);
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
    try {
        const { accessToken, hostName } = RequestUtils_1.default.extractHeaders(req);
        if (!accessToken || !hostName) {
            res.status(400).send("Missing headers");
            return;
        }
        const collectionId = req.body.collection;
        const products = req.body.products;
        if (typeof collectionId !== "string" || !Array.isArray(products)) {
            res.status(400).send("Prameters are not of correct type");
            return;
        }
        const daoFactory = new DaoFactory_1.default(accessToken, hostName);
        const collectionsRestDao = daoFactory.getDAO("collectionsRestDao");
        const collectionsGraphDao = daoFactory.getDAO("collectionsGraphDao");
        const collectionsProductService = new CollectionsProductService_1.default(collectionsGraphDao, collectionsRestDao);
        const result = yield collectionsProductService.removeProductsFromCollection(collectionId, products);
        if (result.error) {
            res.status(500).send("Error removing products. Internal server error");
            return;
        }
        if (result.isSuccess) {
            res
                .status(200)
                .send({ message: "Products successfully removed from collecton" });
            return;
        }
        else {
            res
                .status(500)
                .send({ message: "Error removing products to collection" });
            return;
        }
    }
    catch (err) {
        if (err instanceof ResourceNotFoundException_1.default) {
            res.status(400).send(err);
            return;
        }
        else {
            console.log("Error removing productrs to collection.", err);
            res
                .status(500)
                .send(`Error removing products from collection. Internal server error`);
            return;
        }
    }
}));
app.get("/api/v1/health", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send("Healthy");
}));
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`app is running on ${port}`);
}));
//# sourceMappingURL=main.js.map