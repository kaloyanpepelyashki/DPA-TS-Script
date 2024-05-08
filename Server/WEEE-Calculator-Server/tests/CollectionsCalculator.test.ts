import CollectionsTotalWeightMap from "../BLOC/CollectionsTotalWeighMap";
import CollectionsDAO from "../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";
import OrdersDAO from "../DAOs/OrdersDAO";
import OrderProduct from "../Models/OrderProduct";
import CollectionsCalculator from "../ServiceLayer/Services/CollectionsCalculator";

//TODO Continue implementing the Unit tests
jest.mock("../ServiceLayer/Services/CollectionsManager", () => {
  return jest.fn().mockImplementation(() => {
    return {
      getCollectionNameById: jest.fn().mockResolvedValue([]),
    };
  });
});

jest.mock("../DAOs/OrdersDAO", () => {
  return jest.fn().mockImplementation(() => {
    return {
      getOrdersBetween: jest
        .fn()
        .mockResolvedValue([
          new OrderProduct(1, "TestProduct Title", 2, 12, 4),
          new OrderProduct(2, "TestProduct Title", 3, 44, 2),
          new OrderProduct(3, "TestProduct Title", 2, 20, 1),
          new OrderProduct(4, "TestProduct Title", 4, 50, 4),
        ]),
    };
  });
});

//TODO figure out, if it's necessary to mock all of the methods below

jest.mock("../DAOs/CollectionsDAO", () => {
  return jest.fn().mockImplementation(() => {});
});

jest.mock("../DAOs/CollectionsGraphDAO", () => {
  return jest.fn().mockImplementation(() => {});
});

jest.mock("../BLOC/CollectionsTotalWeightMap", () => {
  return {
    getCollectionsTotalWeight: jest.fn().mockResolvedValue(
      new Map([
        ["Collection1", 120],
        ["Collection2", 80],
      ])
    ),
  };
});

describe("CollectionsCalculator", () => {
  let ordersDaoMock;
  let collectionsRestDaoMock;
  let collectionsGraphDaoMock;
  let calculator;

  beforeEach(() => {
    ordersDaoMock = new OrdersDAO();
    collectionsRestDaoMock = new CollectionsDAO();
    collectionsGraphDaoMock = new CollectionsGraphDAO();

    // Instantiate the CollectionsCalculator with the mocked dependencies
    calculator = new CollectionsCalculator(
      ordersDaoMock,
      collectionsRestDaoMock,
      collectionsGraphDaoMock
    );
  });

  it("should calculate total weight for collections", async () => {
    const result = await calculator.calculateCollectionsTotalWeight([
      "Collection1",
      "Collection2",
    ]);

    // Assertions
    expect(result).toBeInstanceOf(Map);
    expect(result.get("Collection1")).toEqual(120);
    expect(result.get("Collection2")).toEqual(80);

    //TODO fix the error with err: "Property 'getCollectionsTotalWeight' does not exist on type 'typeof CollectionsTotalWeightMap'."
    expect(
      CollectionsTotalWeightMap.getCollectionsTotalWeight
    ).toHaveBeenCalled();
  });
});
