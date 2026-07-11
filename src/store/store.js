import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { baseApi } from './api/baseApi';
import '@/features/users/api/usersApi';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
