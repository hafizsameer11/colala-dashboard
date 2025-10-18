import { apiCall } from '../customApiCall';
import { API_ENDPOINTS } from '../../config/apiConfig';
import Cookies from 'js-cookie';

export interface Category {
  id: number;
  title: string;
  image_url: string;
}

export interface CategoriesResponse {
  status: string;
  data: {
    categories: Category[];
  };
  message: string;
}

export const fetchCategories = async (): Promise<CategoriesResponse> => {
  try {
    const token = Cookies.get('authToken');
    console.log('Fetching categories with token:', token ? 'Present' : 'Missing');
    const response = await apiCall(API_ENDPOINTS.SELLER_CREATION.Categories, 'GET', undefined, token);
    console.log('Categories API response:', response);
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
