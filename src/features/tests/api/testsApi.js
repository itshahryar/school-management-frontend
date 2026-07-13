import { baseApi } from '@/store/api/baseApi';

export const testsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTests: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = '',
        classId = '',
        subjectId = '',
        testTypeId = '',
        testStatusId = '',
      } = {}) => {
        const params = { page, limit };
        if (search.trim()) params.search = search.trim();
        if (classId) params.classId = classId;
        if (subjectId) params.subjectId = subjectId;
        if (testTypeId) params.testTypeId = testTypeId;
        if (testStatusId) params.testStatusId = testStatusId;
        return { url: '/tests', method: 'GET', params };
      },
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result?.tests?.length
          ? [
              ...result.tests.map(({ id }) => ({ type: 'Tests', id })),
              { type: 'Tests', id: 'LIST' },
            ]
          : [{ type: 'Tests', id: 'LIST' }],
    }),

    getTest: builder.query({
      query: (id) => ({ url: `/tests/${id}`, method: 'GET' }),
      transformResponse: (response) => response.data.test,
      providesTags: (_result, _error, id) => [{ type: 'Tests', id }],
    }),

    generateTest: builder.mutation({
      query: (body) => ({
        url: '/tests/generate',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response) => response.data.test,
      invalidatesTags: [
        { type: 'Tests', id: 'LIST' },
        { type: 'Questions', id: 'LIST' },
      ],
    }),

    createManualTest: builder.mutation({
      query: (body) => ({
        url: '/tests/manual',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response) => response.data.test,
      invalidatesTags: [{ type: 'Tests', id: 'LIST' }],
    }),

    updateTest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tests/${id}`,
        method: 'PATCH',
        data: body,
      }),
      transformResponse: (response) => response.data.test,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tests', id },
        { type: 'Tests', id: 'LIST' },
      ],
    }),

    replaceTestQuestions: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tests/${id}/questions`,
        method: 'PUT',
        data: body,
      }),
      transformResponse: (response) => response.data.test,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tests', id },
        { type: 'Tests', id: 'LIST' },
      ],
    }),

    transitionTest: builder.mutation({
      query: ({ id, action }) => ({
        url: `/tests/${id}/transition`,
        method: 'POST',
        data: { action },
      }),
      transformResponse: (response) => response.data.test,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tests', id },
        { type: 'Tests', id: 'LIST' },
        { type: 'Questions', id: 'LIST' },
      ],
    }),

    deleteTest: builder.mutation({
      query: (id) => ({ url: `/tests/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Tests', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTestsQuery,
  useGetTestQuery,
  useGenerateTestMutation,
  useCreateManualTestMutation,
  useUpdateTestMutation,
  useReplaceTestQuestionsMutation,
  useTransitionTestMutation,
  useDeleteTestMutation,
} = testsApi;
