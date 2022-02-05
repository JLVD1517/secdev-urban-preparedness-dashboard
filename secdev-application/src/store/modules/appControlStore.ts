import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitialStateAppControl } from '../../types';

const appControlInitialState: InitialStateAppControl = {
  darkTheme: true,
  sideNavOpen: false,
};

const appControlSlice = createSlice({
  name: 'appControl',
  initialState: appControlInitialState,
  reducers: {
    setDarkTheme: (state, { payload }: PayloadAction<boolean>): void => {
      state.darkTheme = payload;
    },
    setSideNavOpen: (state, { payload }: PayloadAction<boolean>): void => {
      state.sideNavOpen = payload;
    },
  },
});

export const { setDarkTheme, setSideNavOpen } = appControlSlice.actions;

export default appControlSlice.reducer;
