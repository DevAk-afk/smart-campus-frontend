import axios from "axios";

const API = axios.create({ baseURL: "https://smart-campus-backend-ggrp.onrender.com/api" });

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Complaints
export const createComplaint = (formData) =>
  API.post("/complaints/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getComplaints = () => API.get("/complaints");
export const getComplaintById = (id) => API.get(`/complaints/${id}`);
export const updateComplaintStatus = (id, status) =>
  API.patch(`/complaints/${id}/status`, { status });
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
export const getAnalytics = () => API.get("/complaints/analytics");
