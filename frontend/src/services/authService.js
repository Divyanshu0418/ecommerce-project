import api from "./api";

export const loginUser = (data) => {
  return api.post("/auth/login", data);
};

export const registerUser = (data) => {
  return api.post("/auth/register", data);
};

export const sendOtp = (email) => {
  return api.post(`/auth/send-otp?email=${email}`);
};

export const verifyOtp = (email, otp) => {
  return api.post(`/auth/verify-otp?email=${email}&otp=${otp}`);
};
