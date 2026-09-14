export const CART_UPDATED_EVENT = "cart:updated";

export const emitCartUpdated = (totalItems) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, { detail: { totalItems } })
  );
};
