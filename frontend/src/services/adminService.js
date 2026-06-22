import api from "./api";

export const getAllUsers = () => {
  return api.get("/admin/users");
};

export const getAllOrders = () => {
  return api.get("/admin/orders");
};

export const deleteUser = (userId) => {
  return api.delete(`/admin/users/${userId}`);
};

export const updateOrderStatus = (orderId, status) => {
  return api.put(`/admin/orders/${orderId}/status?status=${status}`);
};
