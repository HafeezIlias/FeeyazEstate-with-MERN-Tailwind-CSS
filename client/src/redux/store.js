// Import Redux Toolkit utilities for creating store and combining reducers
import { combineReducers, configureStore } from '@reduxjs/toolkit'
// Import the user slice reducer that handles user-related state
import userReducer from './user/userSlice.js'
// Import redux-persist utilities to persist state in localStorage
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// Combine all reducers into a single root reducer
// Currently only has user reducer, but can be expanded with more slices
const rootReducer = combineReducers({
  user: userReducer,
})

// Configuration for redux-persist
// This determines how the state should be persisted
const persistConfig = {
    key: 'root', // Key used in localStorage to store the state
    storage, // Use localStorage as the storage engine
    version: 1, // Version for migrations if needed
  };

// Wrap the root reducer with persist functionality
// This enables automatic saving/loading of state to/from localStorage
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false, // Disable serializable check for redux-persist compatibility
  }),
})

// Create the persistor that handles the persistence operations
export const persistor = persistStore(store);