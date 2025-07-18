import axios from "axios";


const api = axios.create(
    {
        baseURL: 'http://192.168.231.184:8080',
        headers: {
            "Content-Type": "application/json",
             Accept: "application/json",
        },
        withCredentials: true
    }
);

export const fetchWorkspaces = () => axios.get(`${BASE_URL}/workspaces`);
export const fetchCollections = (workspaceId) =>
  axios.get(`${BASE_URL}/workspaces/${workspaceId}/collections`);
export const saveCollection = (collection) =>
  axios.post(`${BASE_URL}/collections`, collection);
export const saveSession = (session) =>
  axios.post(`${BASE_URL}/sessions`, session);


api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("JWT_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default api;