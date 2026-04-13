import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data: { username: string; email: string; password: string }) =>
  api.post("/auth/register", data);
export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

// Users
export const getMe = () => api.get("/users/me");
export const getUser = (id: string) => api.get(`/users/${id}`);
export const updateMe = (data: { username?: string; bio?: string; avatarKey?: string }) =>
  api.patch("/users/updateMe", data);
export const updatePreferences = (data: object) => api.patch("/users/preferences", data);
export const followUser = (id: string) => api.post(`/users/${id}/follow`);
export const unfollowUser = (id: string) => api.delete(`/users/${id}/unfollow`);
export const getFollowers = (id: string) => api.get(`/users/${id}/followers`);
export const getFollowing = (id: string) => api.get(`/users/${id}/following`);

// Videos
export const getVideos = (params?: object) => api.get("/videos", { params });
export const getVideo = (id: string) => api.get(`/videos/${id}`);
export const uploadVideo = (formData: FormData) => {
  const token = localStorage.getItem("token") || Cookies.get("token");
  return api.post("/videos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "Authorization": `Bearer ${token}`,
    },
  });
};
export const updateVideo = (id: string, data: object) => api.patch(`/videos/${id}`, data);
export const deleteVideo = (id: string) => api.delete(`/videos/${id}`);
export const likeVideo = (id: string) => api.post(`/videos/${id}/like`);
export const unlikeVideo = (id: string) => api.delete(`/videos/${id}/like`);
export const getTrendingVideos = (params?: object) => api.get("/videos/trending", { params });
export const getFollowingFeed = (params?: object) => api.get("/videos/following", { params });

// Reviews
export const createReview = (videoId: string, data: { rating: number; comment: string }) =>
  api.post(`/videos/${videoId}/reviews`, data);

// Admin
export const getAdminStats = () => api.get("/admin/stats");
export const getAdminHealth = () => api.get("/admin/health");
export const getAdminModeration = () => api.get("/admin/moderation");
export const updateUserStatus = (id: string, data: object) =>
  api.patch(`/admin/users/${id}/status`, data);

export default api;