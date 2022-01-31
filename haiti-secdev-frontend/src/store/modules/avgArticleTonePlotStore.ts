import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import { EventsFilters } from '../../types/modules/eventsFilters.type';
import { PlotInitialState } from '../../types/modules/eventsPlots.type';

const avgArticleTonePlotInitialState: PlotInitialState = {
  status: 'idle',
  error: false,
  loaded: false,
  avgTonePlotData: [],
  noOfArticlesPlotData: []
}

export const fetchAvgArticlesTonePlot = createAsyncThunk(
  'avg-tone',
  async (data: EventsFilters) => {
    const {start_date, end_date, language, tone_start_range, tone_end_range} = data;
    const apiUrl = `http://localhost:8000/data/avg-tone/${language}/${start_date}/${end_date}`
    const response = await axios.get(apiUrl, {
        params: {
            tone_end_range: tone_end_range ? tone_end_range : undefined,
            tone_start_range: tone_start_range ? tone_start_range : undefined
        }
    });

    return response;
  },
);

const articlesSlice = createSlice({
  name: 'avg-tone',
  initialState: avgArticleTonePlotInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchAvgArticlesTonePlot.pending, state => {
      state.status = 'Loading';
      state.loaded = false;
      state.error = false;
    });
    builder.addCase(fetchAvgArticlesTonePlot.fulfilled, (state, { payload }) => {
      state.status = 'Loaded';
      state.error = false;
      state.avgTonePlotData = payload.data;
      state.loaded = true;
    });
    builder.addCase(fetchAvgArticlesTonePlot.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching Articles Data';
    });
  },
});

export default articlesSlice.reducer;
