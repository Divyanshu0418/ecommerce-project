import api from "./api";

export const checkoutOrder = () => {
  return api.post("/orders/checkout");
};

export const getMyOrders = () => {
  return api.get("/orders/my");
};

export const payOrder = (orderId) => {
  return api.post(`/payment/pay/${orderId}`);
};
