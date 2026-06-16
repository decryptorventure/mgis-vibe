/* eslint-disable @typescript-eslint/no-unused-vars */
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
// Custom storage object to fix Vite ESM compatibility with redux-persist/lib/storage
const storage = {
  getItem(key: string) {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem(key: string, value: string) {
    window.localStorage.setItem(key, value);
    return Promise.resolve(value);
  },
  removeItem(key: string) {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Placeholder slice to avoid empty store error
const placeholderReducer = (state = {}, _action: unknown) => state;

const rootReducer = combineReducers({
  app: placeholderReducer,
  auth: placeholderReducer,
});

const persistConfig = {
  key: 'nms-auth',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
