import ProductsSoldMap from "../BLOC/ProductsSoldMap";
import Order from "../Models/Order";
import Product from "../Models/Product";

jest.mock("../ServiceLayer/OrdersDAO", () => {
  return {
    default: jest.fn(),
    getInstance: jest.fn().mockImplementation(() => ({
      getOrdersAfter: jest
        .fn()
        .mockResolvedValue([
          new Order([
            new Product(1, 22, 209, 2),
            new Product(2, 8, 199, 1),
            new Product(6, 2, 200, 1),
          ]),
          new Order([
            new Product(3, 22, 500, 1),
            new Product(2, 8, 199, 1),
            new Product(9, 6, 260, 1),
          ]),
          new Order([
            new Product(3, 22, 500, 4),
            new Product(1, 8, 209, 1),
            new Product(9, 6, 260, 1),
          ]),
          new Order([
            new Product(3, 22, 500, 1),
            new Product(2, 8, 199, 1),
            new Product(9, 6, 260, 1),
          ]),
        ]),
    })),
  };
});

describe("ProductsSoldMap", () => {
  let productsSoldMap: ProductsSoldMap;

  beforeEach(() => {
    productsSoldMap = new ProductsSoldMap();
  });

  test("fetchOrders retrieves orders successfully", async () => {
    const orders = await productsSoldMap.getSoldProductsWeight();
    expect(orders).toBeDefined();
    expect(orders.size).toBeGreaterThan(0);
    expect(orders).toEqual(
      new Map([
        [1, 627], //Products with id 1 should weight in total 627 grams
        [2, 597], //Products with id 2 should weight in total 597 grams
        [3, 3000], //Product with id 3 should weight in total 3000 gramms
        [6, 200], //Product with id 6 should weight in total 200 gramms
        [9, 780], //Product with id 9 should weight in total 520 gramms
      ])
    );
  });
});
