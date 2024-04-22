import DaoFactory from "../Factory/DaoFactory";
import ProductsDAO from "../DAOs/ProductsDAO";
import OrdersDAO from "../DAOs/OrdersDAO";
import CollectionsDAO from "../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";

jest.mock("../DAOs/ProductsDAO");
jest.mock("../DAOs/OrdersDAO");
jest.mock("../DAOs/CollectionsDAO");
jest.mock("../DAOs/CollectionsGraphDAO");

describe("DaoFactory tests", () => {
  it("should return an instance of ProductsDAO when requested", () => {
    const factory = new DaoFactory("test-token", "test-host");
    const dao = factory.getDAO<ProductsDAO>("productsDao");

    expect(dao).toBeInstanceOf(ProductsDAO);
  });

  it("should return an instance of CollectionsDAO when requested", () => {
    const factory = new DaoFactory("test-token", "test-host");
    const dao = factory.getDAO<CollectionsDAO>("collectionsRestDao");

    expect(dao).toBeInstanceOf(CollectionsDAO);
  });

  it("should return an instance of OrdersDAO when requested", () => {
    const factory = new DaoFactory("test-token", "test-host");
    const dao = factory.getDAO<OrdersDAO>("ordersDao");

    expect(dao).toBeInstanceOf(OrdersDAO);
  });

  it("should return an instance of CollectionsGraphDAO when requested", () => {
    const factory = new DaoFactory("test-token", "test-host");
    const dao = factory.getDAO<CollectionsGraphDAO>("collectionsGraphDao");

    expect(dao).toBeInstanceOf(CollectionsGraphDAO);
  });
});
