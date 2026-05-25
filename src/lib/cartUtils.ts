import { IProduct, ICartItem } from "src/context/CartContext";

/**
 * Чистая функция для добавления продукта в массив элементов корзины.
 * Для физических товаров (браслетов) увеличивает количество.
 * Для курсов и услуг оставляет количество равным 1.
 */
export function addItemToCartHelper(prevItems: ICartItem[], product: IProduct): ICartItem[] {
  const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);

  if (existingItemIndex > -1) {
    if (product.category === "BRACELET") {
      const updatedItems = [...prevItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1,
      };
      return updatedItems;
    }
    return prevItems; // Для курсов и услуг количество не увеличиваем
  }

  return [...prevItems, { product, quantity: 1 }];
}

/**
 * Чистая функция для расчета общей суммы корзины
 */
export function calculateCartTotal(items: ICartItem[]): number {
  return items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
}

/**
 * Чистая функция для расчета общего количества элементов в корзине
 */
export function calculateCartCount(items: ICartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}
