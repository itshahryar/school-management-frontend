import { baseApi } from '@/store/api/baseApi';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = '',
        role = '',
        isActive = '',
      } = {}) => {
        const params = { page, limit };

        if (search.trim()) params.search = search.trim();
        if (role) params.role = role;
        if (isActive === 'true' || isActive === 'false') {
          params.isActive = isActive;
        }

        return {
          url: '/auth/users',
          method: 'GET',
          params,
        };
      },
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result?.users?.length
          ? [
              ...result.users.map(({ id }) => ({ type: 'Users', id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/auth/users/${id}`,
        method: 'PATCH',
        data: body,
      }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Users', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetUsersQuery, useUpdateUserMutation } = usersApi;
