import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api", // Relative path for Vercel
    timeout: 5000,   // Timeout for requests
});

export default apiClient;
