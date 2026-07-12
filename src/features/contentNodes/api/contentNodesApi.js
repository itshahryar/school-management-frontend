import { baseApi } from '@/store/api/baseApi';

export const contentNodesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContentTree: builder.query({
      query: ({ subjectId, isActive = '' } = {}) => {
        const params = { subjectId, tree: 'true' };
        if (isActive === 'true' || isActive === 'false') {
          params.isActive = isActive;
        }
        return { url: '/content-nodes', method: 'GET', params };
      },
      transformResponse: (response) => response.data.nodes ?? [],
      providesTags: [{ type: 'ContentNodes', id: 'LIST' }],
    }),

    getContentNode: builder.query({
      query: (id) => ({ url: `/content-nodes/${id}`, method: 'GET' }),
      transformResponse: (response) => response.data.node,
      providesTags: (_result, _error, id) => [{ type: 'ContentNodes', id }],
    }),

    createContentNode: builder.mutation({
      query: (body) => ({ url: '/content-nodes', method: 'POST', data: body }),
      transformResponse: (response) => response.data.node,
      invalidatesTags: [
        { type: 'ContentNodes', id: 'LIST' },
        { type: 'Subjects', id: 'LIST' },
      ],
    }),

    updateContentNode: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/content-nodes/${id}`,
        method: 'PATCH',
        data: body,
      }),
      transformResponse: (response) => response.data.node,
      invalidatesTags: [{ type: 'ContentNodes', id: 'LIST' }],
    }),

    deleteContentNode: builder.mutation({
      query: (id) => ({ url: `/content-nodes/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'ContentNodes', id: 'LIST' },
        { type: 'Subjects', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetContentTreeQuery,
  useGetContentNodeQuery,
  useCreateContentNodeMutation,
  useUpdateContentNodeMutation,
  useDeleteContentNodeMutation,
} = contentNodesApi;
