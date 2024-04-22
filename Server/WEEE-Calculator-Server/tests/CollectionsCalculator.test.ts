import CollectionsTotalWeightMap from "../BLOC/CollectionsTotalWeighMap";
import CollectionsDAO from "../DAOs/CollectionsDAO";
import CollectionsGraphDAO from "../DAOs/CollectionsGraphDAO";
import OrdersDAO from "../DAOs/OrdersDAO";
import CollectionsCalculator from "../ServiceLayer/Services/CollectionsCalculator";

jest.mock("../ServiceLayer/Services/CollectionsManager", () => {});

jest.mock("../DAOs/OrdersDAO", () => {
  return jest.fn().mockImplementation(() => {});
});

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

    expect(
      CollectionsTotalWeightMap.getCollectionsTotalWeight
    ).toHaveBeenCalled();
  });
});
