import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
      signinStart:(state) => {
          state.loading = true;
      },
      signinSuccess:(state,action) => {
          state.loading = false;
          state.currentUser = action.payload; //payload is the data that we send from the backend (user data)
          state.error = null;
      },
      signinFailure:(state,action) => {
        state.loading = false;
        state.error = action.payload;
      },
      updateUserStart:(state) => {
        state.loading = true;
      },
      updateUserSuccess:(state,action) => {
        state.loading = false;
        state.currentUser = action.payload; //payload is the updated user data that we send from the backend
        state.error = null;
      },
      updateUserFailure:(state,action) => {
        state.loading = false;
        state.error = action.payload;
      },
    },
  });
  
  export const {signinStart,signinSuccess,signinFailure,updateUserStart,updateUserSuccess,updateUserFailure} = userSlice.actions;
  export default userSlice.reducer; //when default we can change the name while importing
  