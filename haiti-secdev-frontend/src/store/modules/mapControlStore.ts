import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitialStateMapControl } from '../../types';

const mapControlInitialState: InitialStateMapControl = {
  satelliteView: false,
};

const mapControlSlice = createSlice({
  name: 'mapControl',
  initialState: mapControlInitialState,
  reducers: {
    setSatelliteView: (state, { payload }: PayloadAction<boolean>): void => {
      state.satelliteView = payload;
    },
  },
});

export const { setSatelliteView } = mapControlSlice.actions;

export default mapControlSlice.reducer;
