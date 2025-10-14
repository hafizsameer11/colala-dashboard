import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../config/apiConfig";

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
