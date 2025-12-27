import { apiCall } from "../customApiCall";
import { API_ENDPOINTS } from "../../config/apiConfig";
import Cookies from "js-cookie";

/**
 * Create a new user
 */
export const createUser = async (userData: {
  full_name: string;
  user_name: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  state: string;
  role?: "buyer" | "seller" | "admin";
  referral_code?: string;
  profile_picture?: File;
}) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    // Create FormData for file upload support
    const formData = new FormData();
    formData.append("full_name", userData.full_name);
    formData.append("user_name", userData.user_name);
    formData.append("email", userData.email);
    formData.append("phone", userData.phone);
    formData.append("password", userData.password);
    formData.append("country", userData.country);
    formData.append("state", userData.state);

    // Add role (required by backend, should be 'buyer', 'seller', or 'admin')
    formData.append("role", userData.role || "buyer");

    if (userData.referral_code) {
      formData.append("referral_code", userData.referral_code);
    }

    if (userData.profile_picture) {
      formData.append("profile_picture", userData.profile_picture);
    }

    const response = await apiCall(
      API_ENDPOINTS.ALL_USERS.Create,
      "POST",
      formData,
      token
    );
    return response;
  } catch (error) {
    console.error("Create user API call error:", error);
    throw error;
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (userData: {
  userId: number | string;
  full_name: string;
  user_name: string;
  email: string;
  phone: string;
  password?: string;
  country: string;
  state: string;
  role?: "buyer" | "seller";
  status?: "active" | "inactive";
  referral_code?: string;
  profile_picture?: File;
}) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    // Create FormData for file upload support
    const formData = new FormData();
    formData.append("full_name", userData.full_name);
    formData.append("user_name", userData.user_name);
    formData.append("email", userData.email);
    formData.append("phone", userData.phone);
    formData.append("country", userData.country);
    formData.append("state", userData.state);

    if (userData.password) {
      formData.append("password", userData.password);
    }

    if (userData.role) {
      formData.append("role", userData.role);
    }

    if (userData.status) {
      formData.append("status", userData.status);
    }

    if (userData.referral_code) {
      formData.append("referral_code", userData.referral_code);
    }

    if (userData.profile_picture) {
      formData.append("profile_picture", userData.profile_picture);
    }

    const response = await apiCall(
      API_ENDPOINTS.ALL_USERS.Update(userData.userId),
      "POST",
      formData,
      token
    );
    return response;
  } catch (error) {
    console.error("Update user API call error:", error);
    throw error;
  }
};

/**
 * Top up user wallet (admin action)
 */
export const topUpWallet = async (
  userId: number | string,
  amount: number,
  description?: string
) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const data = {
      amount,
      ...(description && { description }),
    };

    const response = await apiCall(
      API_ENDPOINTS.BUYER_USERS.TopUp(userId),
      "POST",
      data,
      token
    );
    return response;
  } catch (error) {
    console.error("Top up wallet API call error:", error);
    throw error;
  }
};

/**
 * Withdraw from user wallet (admin action)
 */
export const withdrawWallet = async (
  userId: number | string,
  amount: number,
  description?: string
) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const data = {
      amount,
      ...(description && { description }),
    };

    const response = await apiCall(
      API_ENDPOINTS.BUYER_USERS.Withdraw(userId),
      "POST",
      data,
      token
    );
    return response;
  } catch (error) {
    console.error("Withdraw wallet API call error:", error);
    throw error;
  }
};

/**
 * Create a new knowledge base item
 */
export const createKnowledgeBase = async (kbData: {
  title: string;
  description?: string;
  type: "general" | "buyer" | "seller";
  url?: string;
  video?: File | null;
  is_active?: boolean;
}) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const formData = new FormData();
    formData.append("title", kbData.title);
    formData.append("type", kbData.type);

    if (kbData.description) {
      formData.append("description", kbData.description);
    }

    if (kbData.url) {
      formData.append("url", kbData.url);
    }

    if (kbData.video && kbData.video instanceof File) {
      formData.append("video", kbData.video);
    }

    if (kbData.is_active !== undefined) {
      formData.append("is_active", kbData.is_active ? "1" : "0");
    }

    const response = await apiCall(
      API_ENDPOINTS.KNOWLEDGE_BASE.Create,
      "POST",
      formData,
      token
    );
    return response;
  } catch (error) {
    console.error("Create knowledge base API call error:", error);
    throw error;
  }
};

/**
 * Update a knowledge base item
 */
export const updateKnowledgeBase = async (
  id: number | string,
  kbData: {
    title?: string;
    description?: string;
    type?: "general" | "buyer" | "seller";
    url?: string;
    video?: File | null;
    is_active?: boolean;
  }
) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const formData = new FormData();

    // Always send title and type if provided
    if (kbData.title !== undefined) {
      formData.append("title", kbData.title);
    }

    // Send description if provided (can be empty string)
    if (kbData.description !== undefined) {
      formData.append("description", kbData.description || "");
    }

    // Always send type if provided
    if (kbData.type !== undefined) {
      formData.append("type", kbData.type);
    }

    // Send url if provided (can be empty string to clear it)
    if (kbData.url !== undefined) {
      formData.append("url", kbData.url || "");
    }

    // Send video file if it's a File object
    if (kbData.video && kbData.video instanceof File) {
      formData.append("video", kbData.video);
    }

    // Always send is_active if provided
    if (kbData.is_active !== undefined) {
      formData.append("is_active", kbData.is_active ? "1" : "0");
    }

    const response = await apiCall(
      API_ENDPOINTS.KNOWLEDGE_BASE.Update(id),
      "PUT",
      formData,
      token
    );
    return response;
  } catch (error) {
    console.error("Update knowledge base API call error:", error);
    throw error;
  }
};

/**
 * Delete a knowledge base item
 */
export const deleteKnowledgeBase = async (id: number | string) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await apiCall(
      API_ENDPOINTS.KNOWLEDGE_BASE.Delete(id),
      "DELETE",
      undefined,
      token
    );
    return response;
  } catch (error) {
    console.error("Delete knowledge base API call error:", error);
    throw error;
  }
};

/**
 * Toggle knowledge base item status
 */
export const toggleKnowledgeBaseStatus = async (id: number | string) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await apiCall(
      API_ENDPOINTS.KNOWLEDGE_BASE.ToggleStatus(id),
      "POST",
      undefined,
      token
    );
    return response;
  } catch (error) {
    console.error("Toggle knowledge base status API call error:", error);
    throw error;
  }
};

/**
 * Create a new address for a user
 */
export const createUserAddress = async (
  userId: number | string,
  addressData: {
    phone: string;
    state: string;
    local_government?: string;
    city?: string;
    line1: string;
    line2?: string;
    is_default?: boolean;
  }
) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await apiCall(
      API_ENDPOINTS.ALL_USERS.CreateAddress(userId),
      "POST",
      addressData,
      token
    );
    return response;
  } catch (error) {
    console.error("Create user address API call error:", error);
    throw error;
  }
};

/**
 * Update an existing address for a user
 */
export const updateUserAddress = async (
  userId: number | string,
  addressId: number | string,
  addressData: {
    phone?: string;
    state?: string;
    local_government?: string;
    city?: string;
    line1?: string;
    line2?: string;
    is_default?: boolean;
  }
) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    // Use PUT method with addressId in URL path
    const payload: any = {};
    
    // Add all address data fields
    if (addressData.phone !== undefined) payload.phone = addressData.phone;
    if (addressData.state !== undefined) payload.state = addressData.state;
    if (addressData.city !== undefined) {
      payload.city = addressData.city;
    } else if (addressData.local_government !== undefined) {
      payload.city = addressData.local_government; // API uses 'city' field for local government
    }
    if (addressData.local_government !== undefined) payload.local_government = addressData.local_government;
    if (addressData.line1 !== undefined) payload.line1 = addressData.line1;
    if (addressData.line2 !== undefined && addressData.line2 !== null && addressData.line2 !== '') {
      payload.line2 = addressData.line2;
    }
    if (addressData.is_default !== undefined) payload.is_default = addressData.is_default;
    
    const endpoint = API_ENDPOINTS.ALL_USERS.UpdateAddress(userId, addressId);
    
    console.log('Update address payload:', JSON.stringify(payload, null, 2));
    console.log('Update address endpoint:', endpoint);
    console.log('Using PUT method with addressId in URL:', addressId);
    
    const response = await apiCall(
      endpoint,
      "PUT",
      payload,
      token
    );
    
    console.log('Update address response:', response);
    return response;
  } catch (error) {
    console.error("Update user address API call error:", error);
    throw error;
  }
};

/**
 * Delete an address for a user
 */
export const deleteUserAddress = async (
  userId: number | string,
  addressId: number | string
) => {
  const token = Cookies.get("authToken");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    // Use DELETE method with addressId in URL path
    const endpoint = API_ENDPOINTS.ALL_USERS.DeleteAddress(userId, addressId);
    
    console.log('Delete address endpoint:', endpoint);
    console.log('Using DELETE method with addressId in URL:', addressId);
    
    const response = await apiCall(
      endpoint,
      "DELETE",
      undefined, // No payload needed for DELETE
      token
    );
    
    console.log('Delete address response:', response);
    return response;
  } catch (error) {
    console.error("Delete user address API call error:", error);
    throw error;
  }
};
