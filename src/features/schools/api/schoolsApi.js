import { baseApi } from '@/store/api/baseApi';

export const schoolsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchools: builder.query({
      query: ({ page = 1, limit = 10, search = '', isActive = '' } = {}) => {
        const params = { page, limit };
        if (search.trim()) params.search = search.trim();
        if (isActive === 'true' || isActive === 'false') {
          params.isActive = isActive;
        }
        return { url: '/schools', method: 'GET', params };
      },
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result?.schools?.length
          ? [
              ...result.schools.map(({ id }) => ({ type: 'Schools', id })),
              { type: 'Schools', id: 'LIST' },
            ]
          : [{ type: 'Schools', id: 'LIST' }],
    }),

    getSchool: builder.query({
      query: (id) => ({ url: `/schools/${id}`, method: 'GET' }),
      transformResponse: (response) => response.data.school,
      providesTags: (_result, _error, id) => [{ type: 'Schools', id }],
    }),

    getMySchools: builder.query({
      query: () => ({ url: '/schools/me', method: 'GET' }),
      transformResponse: (response) => response.data.schools,
      providesTags: [{ type: 'Schools', id: 'MY' }],
    }),

    getSchoolCurriculum: builder.query({
      query: (id) => ({ url: `/schools/${id}/curriculum`, method: 'GET' }),
      transformResponse: (response) => response.data,
      providesTags: (_result, _error, id) => [
        { type: 'Schools', id },
        { type: 'SchoolCurriculum', id },
      ],
    }),

    createSchool: builder.mutation({
      query: (body) => ({ url: '/schools', method: 'POST', data: body }),
      transformResponse: (response) => response.data.school,
      invalidatesTags: [{ type: 'Schools', id: 'LIST' }],
    }),

    updateSchool: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/schools/${id}`,
        method: 'PATCH',
        data: body,
      }),
      transformResponse: (response) => response.data.school,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Schools', id },
        { type: 'Schools', id: 'LIST' },
        { type: 'Schools', id: 'MY' },
        { type: 'SchoolCurriculum', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),

    deleteSchool: builder.mutation({
      query: (id) => ({ url: `/schools/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Schools', id },
        { type: 'Schools', id: 'LIST' },
        { type: 'Schools', id: 'MY' },
      ],
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useGetSchoolQuery,
  useGetMySchoolsQuery,
  useGetSchoolCurriculumQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
} = schoolsApi;
