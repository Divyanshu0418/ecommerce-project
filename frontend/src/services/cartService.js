import api from "./api";

export const getCart = () => {
  return api.get("/cart");
};

export const addToCart = (productId) => {
  return api.post(`/cart/add/${productId}`);
};

export const removeFromCart = (cartItemId) => {
  return api.delete(`/cart/remove/${cartItemId}`);
};

export const updateCartQuantity = (cartItemId, quantity) => {
  return api.put(`/cart/update/${cartItemId}?quantity=${quantity}`);
};
