import axios from "axios";

const BACKEND_URL =
  (typeof process !== "undefined" && process?.env?.REACT_APP_BACKEND_URL) || "";
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

export default api;
