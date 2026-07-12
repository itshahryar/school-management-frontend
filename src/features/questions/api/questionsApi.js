import { baseApi } from '@/store/api/baseApi';

export const questionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query({
      query: ({
        page = 1,
        limit = 10,
        contentNodeId = '',
        subjectId = '',
        type = '',
        difficulty = '',
        search = '',
        isActive = '',
        sort = 'latest',
      } = {}) => {
        const params = { page, limit, sort };
        if (contentNodeId) params.contentNodeId = contentNodeId;
        if (subjectId) params.subjectId = subjectId;
        if (type) params.type = type;
        if (difficulty) params.difficulty = difficulty;
        if (search.trim()) params.search = search.trim();
        if (isActive === 'true' || isActive === 'false') {
          params.isActive = isActive;
        }
        return { url: '/questions', method: 'GET', params };
      },
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result?.questions?.length
          ? [
              ...result.questions.map(({ id }) => ({ type: 'Questions', id })),
              { type: 'Questions', id: 'LIST' },
            ]
          : [{ type: 'Questions', id: 'LIST' }],
    }),

    getQuestion: builder.query({
      query: (id) => ({ url: `/questions/${id}`, method: 'GET' }),
      transformResponse: (response) => response.data.question,
      providesTags: (_result, _error, id) => [{ type: 'Questions', id }],
    }),

    createQuestion: builder.mutation({
      query: (body) => ({ url: '/questions', method: 'POST', data: body }),
      transformResponse: (response) => response.data.question,
      invalidatesTags: [
        { type: 'Questions', id: 'LIST' },
        { type: 'ContentNodes', id: 'LIST' },
      ],
    }),

    bulkCreateQuestions: builder.mutation({
      query: (body) => ({
        url: '/questions/bulk',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'Questions', id: 'LIST' },
        { type: 'ContentNodes', id: 'LIST' },
      ],
    }),

    updateQuestion: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/questions/${id}`,
        method: 'PATCH',
        data: body,
      }),
      transformResponse: (response) => response.data.question,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Questions', id },
        { type: 'Questions', id: 'LIST' },
        { type: 'ContentNodes', id: 'LIST' },
      ],
    }),

    deleteQuestion: builder.mutation({
      query: (id) => ({ url: `/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Questions', id: 'LIST' },
        { type: 'ContentNodes', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetQuestionQuery,
  useCreateQuestionMutation,
  useBulkCreateQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionsApi;
