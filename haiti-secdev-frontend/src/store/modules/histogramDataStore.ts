import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import { InitialHistogramDataState } from '../../types';

const histogramDataInitialState: InitialHistogramDataState = {
  columnData: [],
  status: 'idle',
  error: false,
  loaded: false,
};

export const fetchColumnData = createAsyncThunk(
  'column-data',
  async (apiUrl: string) => {
    // const response = await axios.get(apiUrl);
    // return response.data;

    return {data: [1,2]}
  },
);

const histogramDataSlice = createSlice({
  name: 'availableYears',
  initialState: histogramDataInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchColumnData.pending, state => {
      state.status = 'Loading';
      state.loaded = false;
      state.error = false;
    });
    builder.addCase(fetchColumnData.fulfilled, (state, { payload }) => {
      state.status = 'Loaded';
      state.error = false;
      state.columnData = payload.data;
      state.loaded = true;
    });
    builder.addCase(fetchColumnData.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching Column Endpoint Data';
    });
  },
});

export default histogramDataSlice.reducer;
