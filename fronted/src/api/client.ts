import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse } from '../types';

/**
 * API 请求客户端
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    // 检查业务状态码
    if (data.code !== 0) {
      console.error(`[API Error] ${data.message}`);
      return Promise.reject(new Error(data.message));
    }
    return response;
  },
  (error) => {
    console.error('[API Error]', error.message);
    return Promise.reject(error);
  }
);

/**
 * 通用请求方法
 */
export async function request<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: unknown
): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>({
    method,
    url,
    data: method !== 'get' ? data : undefined,
    params: method === 'get' ? data : undefined,
  });
  return response.data.data;
}

export default apiClient;
