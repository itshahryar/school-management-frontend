import { baseApi } from '@/store/api/baseApi';

export const testMetaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTestTypes: builder.query({
      query: ({ isActive = 'true' } = {}) => {
        const params = {};
        if (isActive === 'true' || isActive === 'false') {
          params.isActive = isActive;
        }
        return { url: '/test-meta/types', method: 'GET', params };
      },
      transformResponse: (response) => response.data.testTypes ?? [],
      providesTags: [{ type: 'TestMeta', id: 'TYPES' }],
    }),

    getTestStatuses: builder.query({
      query: ({ isActive = 'true' } = {}) => {
        const params = {};
        if (isActive === 'true' || isActive === 'false') {
          params.isActive = isActive;
        }
        return { url: '/test-meta/statuses', method: 'GET', params };
      },
      transformResponse: (response) => response.data.testStatuses ?? [],
      providesTags: [{ type: 'TestMeta', id: 'STATUSES' }],
    }),
  }),
});

export const { useGetTestTypesQuery, useGetTestStatusesQuery } = testMetaApi;
