import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../config/apiConfig";
import Cookies from "js-cookie";

// POST /auth/login
export const loginUser = async (
  payload: { email: string; password: string }
): Promise<any> => {
  return await apiCall(
    API_ENDPOINTS.AUTH.Login,
    "POST",
    payload
  );
};

// POST /admin/logout
export const logoutUser = async (): Promise<any> => {
  const token = Cookies.get("authToken");
  return await apiCall(
    API_ENDPOINTS.AUTH.Logout,
    "POST",
    {},
    token
  );
};
