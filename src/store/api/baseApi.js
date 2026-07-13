import { createApi } from '@reduxjs/toolkit/query/react';
import axios from '@/lib/axios';

/**
 * Axios-backed baseQuery so RTK Query reuses cookies and the 401 interceptor.
 */
const axiosBaseQuery =
  () =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await axios({
        url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (error) {
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || error.message,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Users',
    'Classes',
    'Subjects',
    'ContentNodes',
    'Questions',
    'Tests',
    'TestMeta',
  ],
  endpoints: () => ({}),
});
