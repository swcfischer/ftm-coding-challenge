import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// AI Assistant endpoints
export const sendMessage = async (message) => {
  const response = await api.post("/api/messages", { message });
  return response.data;
};

export const getMessages = async (limit = 20) => {
  const response = await api.get(`/api/messages?limit=${limit}`);
  return response.data;
};

// Knowledge Base endpoints
export const getKnowledgeBase = async (search = "", tags = []) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (tags.length > 0) params.append("tags", tags.join(","));

  const response = await api.get(`/api/knowledge-base?${params}`);
  return response.data;
};

export const saveToKnowledgeBase = async (data) => {
  const response = await api.post("/api/knowledge-base", data);
  return response.data;
};

export const updateKnowledgeBaseItem = async (id, data) => {
  const response = await api.put(`/api/knowledge-base/${id}`, data);
  return response.data;
};

export const deleteKnowledgeBaseItem = async (id) => {
  const response = await api.delete(`/api/knowledge-base/${id}`);
  return response.data;
};

// Tags endpoints
export const getTags = async () => {
  const response = await api.get("/api/tags");
  return response.data;
};

export default api;
