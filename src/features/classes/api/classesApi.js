import { baseApi } from '@/store/api/baseApi';

export const classesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query({
      query: ({ page = 1, limit = 10, search = '', isActive = '' } = {}) => {
        const params = { page, limit };
        if (search.trim()) params.search = search.trim();
        if (isActive === 'true' || isActive === 'false') {
          params.isActive = isActive;
        }
        return { url: '/classes', method: 'GET', params };
      },
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result?.classes?.length
          ? [
              ...result.classes.map(({ id }) => ({ type: 'Classes', id })),
              { type: 'Classes', id: 'LIST' },
            ]
          : [{ type: 'Classes', id: 'LIST' }],
    }),

    getClass: builder.query({
      query: (id) => ({ url: `/classes/${id}`, method: 'GET' }),
      transformResponse: (response) => response.data.class,
      providesTags: (_result, _error, id) => [{ type: 'Classes', id }],
    }),

    createClass: builder.mutation({
      query: (body) => ({ url: '/classes', method: 'POST', data: body }),
      transformResponse: (response) => response.data.class,
      invalidatesTags: [{ type: 'Classes', id: 'LIST' }],
    }),

    updateClass: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/classes/${id}`,
        method: 'PATCH',
        data: body,
      }),
      transformResponse: (response) => response.data.class,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Classes', id },
        { type: 'Classes', id: 'LIST' },
      ],
    }),

    deleteClass: builder.mutation({
      query: (id) => ({ url: `/classes/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Classes', id },
        { type: 'Classes', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useGetClassQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classesApi;
