import { baseApi } from '@/store/api/baseApi';

export const subjectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: ({
        page = 1,
        limit = 10,
        classId = '',
        search = '',
        isActive = '',
      } = {}) => {
        const params = { page, limit };
        if (classId) params.classId = classId;
        if (search.trim()) params.search = search.trim();
        if (isActive === 'true' || isActive === 'false') {
          params.isActive = isActive;
        }
        return { url: '/subjects', method: 'GET', params };
      },
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result?.subjects?.length
          ? [
              ...result.subjects.map(({ id }) => ({ type: 'Subjects', id })),
              { type: 'Subjects', id: 'LIST' },
            ]
          : [{ type: 'Subjects', id: 'LIST' }],
    }),

    getSubject: builder.query({
      query: (id) => ({ url: `/subjects/${id}`, method: 'GET' }),
      transformResponse: (response) => response.data.subject,
      providesTags: (_result, _error, id) => [{ type: 'Subjects', id }],
    }),

    createSubject: builder.mutation({
      query: (body) => ({ url: '/subjects', method: 'POST', data: body }),
      transformResponse: (response) => response.data.subject,
      invalidatesTags: [
        { type: 'Subjects', id: 'LIST' },
        { type: 'Classes', id: 'LIST' },
      ],
    }),

    updateSubject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/subjects/${id}`,
        method: 'PATCH',
        data: body,
      }),
      transformResponse: (response) => response.data.subject,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Subjects', id },
        { type: 'Subjects', id: 'LIST' },
        { type: 'Classes', id: 'LIST' },
      ],
    }),

    deleteSubject: builder.mutation({
      query: (id) => ({ url: `/subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Subjects', id },
        { type: 'Subjects', id: 'LIST' },
        { type: 'Classes', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi;
