import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id?: string;
  employeeId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      const user = action.payload;
      if (user && !user.firstName && user.name) {
        const parts = user.name.split(' ');
        user.firstName = parts[0] || '';
        user.lastName = parts.slice(1).join(' ') || '';
      }
      state.user = user;
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
