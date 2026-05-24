import { describe, test, expect } from "vitest";
import { IProduct } from "src/data/products";
import { ICartItem } from "src/context/CartContext";
import {
  addItemToCartHelper,
  calculateCartCount,
  calculateCartTotal,
} from "./cartUtils";

// Тестовые продукты
const mockBracelet: IProduct = {
  id: "test-bracelet",
  name: "Тестовый браслет",
  description: "Описание",
  price: 1000,
  imageUrl: "",
  category: "BRACELET",
  isAvailable: true,
};

const mockCourse: IProduct = {
  id: "test-course",
  name: "Тестовый курс",
  description: "Описание",
  price: 5000,
  imageUrl: "",
  category: "COURSE",
  isAvailable: true,
};

describe("Логика корзины (Cart Utilities)", () => {
  
  test("addItemToCartHelper: добавление нового товара в пустую корзину", () => {
    const initialItems: ICartItem[] = [];
    const result = addItemToCartHelper(initialItems, mockBracelet);

    expect(result).toHaveLength(1);
    expect(result[0].product.id).toBe("test-bracelet");
    expect(result[0].quantity).toBe(1);
  });

  test("addItemToCartHelper: повторное добавление физического товара (браслета) увеличивает количество", () => {
    const initialItems: ICartItem[] = [{ product: mockBracelet, quantity: 1 }];
    const result = addItemToCartHelper(initialItems, mockBracelet);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(2);
  });

  test("addItemToCartHelper: повторное добавление курса НЕ увеличивает количество (всегда остается 1)", () => {
    const initialItems: ICartItem[] = [{ product: mockCourse, quantity: 1 }];
    const result = addItemToCartHelper(initialItems, mockCourse);

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(1);
  });

  test("calculateCartTotal: корректный расчет общей стоимости товаров в корзине", () => {
    const cartItems: ICartItem[] = [
      { product: mockBracelet, quantity: 3 }, // 3 * 1000 = 3000
      { product: mockCourse, quantity: 1 },    // 1 * 5000 = 5000
    ];
    const total = calculateCartTotal(cartItems);

    expect(total).toBe(8000);
  });

  test("calculateCartCount: корректный расчет общего количества товаров в корзине", () => {
    const cartItems: ICartItem[] = [
      { product: mockBracelet, quantity: 3 },
      { product: mockCourse, quantity: 1 },
    ];
    const count = calculateCartCount(cartItems);

    expect(count).toBe(4);
  });

});
