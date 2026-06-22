import api from "./api";

export const getProducts = () => {
  return api.get("/products");
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const searchProducts = (name) => {
  return api.get(`/products/search?name=${name}`);
};

export const filterByCategory = (category) => {
  return api.get(`/products/category?category=${category}`);
};

export const filterByPrice = (min, max) => {
  return api.get(`/products/price?min=${min}&max=${max}`);
};

export const addProduct = (product) => {
  return api.post("/products", product);
};

export const updateProduct = (id, product) => {
  return api.put(`/products/${id}`, product);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

export const uploadProductImage = (productId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/products/upload-image/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
