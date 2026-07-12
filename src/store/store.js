import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { baseApi } from './api/baseApi';
import '@/features/users/api/usersApi';
import '@/features/classes/api/classesApi';
import '@/features/subjects/api/subjectsApi';
import '@/features/contentNodes/api/contentNodesApi';
import '@/features/questions/api/questionsApi';

const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
