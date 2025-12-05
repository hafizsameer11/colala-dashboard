import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../config/apiConfig";
import Cookies from "js-cookie";

export const createStorePost = async (storeId: number | string, formData: FormData) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = API_ENDPOINTS.STORE_POSTS.Create(storeId);
  return await apiCall(url, "POST", formData, token);
};
