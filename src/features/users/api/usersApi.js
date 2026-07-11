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
  }),
});

export const { useGetUsersQuery } = usersApi;
