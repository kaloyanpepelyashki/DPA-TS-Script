import CollectionsTotalWeightMap from "../BLOC/CollectionsTotalWeighMap";
import CollectionsMap from "../BLOC/CollectionsMap";
import ProductsSoldMap from "../BLOC/ProductsSoldMap";

jest.mock("../BLOC/CollectionsMap");
jest.mock("../BLOC/ProductsSoldMap");

describe("CollectionsTotalWeightMap", () => {
  it("Should calculate the total weight of products sold for each collection", async () => {
    CollectionsMap.prototype.getDpaCollectionsMap = jest.fn().mockResolvedValue(
      new Map([
        [1, [101, 201, 301, 401]],
        [2, [102, 202, 302, 402]],
        [3, [103, 203, 303, 403]],
        [4, [104, 204, 304, 404]],
      ])
    );

    //Mocking values
    ProductsSoldMap.prototype.getSoldProductsWeight = jest
      .fn()
      .mockResolvedValue(
        new Map([
          //The weight is in grams
          [101, 2000],
          [201, 2000],
          [301, 100],
          [401, 500],
          [102, 2000],
          [202, 500],
          [302, 150],
          [402, 500],
          [103, 1000],
          [203, 5000],
          [303, 1250],
          [403, 1000],
          [104, 1200],
          [204, 1000],
          [304, 1],
          [404, 500],
        ])
      );
    const collectionsTotalWeightMap = new CollectionsTotalWeightMap();
    const result = await collectionsTotalWeightMap.getCollectionsTotalWeight();

    // Expected results
    expect(result).toEqual(
      new Map([
        [1, 4.6], // Collection 1 total weight in kilograms (4.6 kg) (4600 g)
        [2, 3.15], // Collection 2 total weight in kg (1.5 kg) (3150 g)
        [3, 8.25], // Collection 3 total weight in kg (8.2 kg) (8250 g)
        [4, 2.701], // Collection 4 total weight in kg (2.7 kg) (2701 g)
      ])
    );
  });
});
