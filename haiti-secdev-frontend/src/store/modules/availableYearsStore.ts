import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import { InitialAvailableYearsState } from '../../types';

const availableYearsInitialState: InitialAvailableYearsState = {
  availableYears: [],
  status: 'idle',
  error: false,
  loaded: false,
};

export const fetchAvailableYears = createAsyncThunk(
  'data-years',
  async (apiUrl: string) => {
    // const response = await axios.get(apiUrl);
    const response = {
      data: {
        '2021': [11, 12],
        '2022': [1],
      },
    };
    const formattedRes = Object.keys(response.data).map(year => Number(year));
    return formattedRes;
  },
);

const availableYearsSlice = createSlice({
  name: 'availableYears',
  initialState: availableYearsInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchAvailableYears.pending, state => {
      state.status = 'Loading';
      state.loaded = false;
      state.error = false;
    });
    builder.addCase(fetchAvailableYears.fulfilled, (state, { payload }) => {
      state.status = 'Loaded';
      state.error = false;
      state.availableYears = payload;
      state.loaded = true;
    });
    builder.addCase(fetchAvailableYears.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching Year Endpoint Data';
    });
  },
});

export default availableYearsSlice.reducer;
