import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import { EventsFilters } from '../../types/modules/eventsFilters.type';
import { AvgTonePlotInitialState } from '../../types/modules/eventsPlots.type';
import { PlotData } from '../../types';

const avgArticleTonePlotInitialState: AvgTonePlotInitialState = {
  status: 'idle',
  error: false,
  loaded: false,
  avgTonePlotData: []
}

export const fetchAvgArticlesTonePlot = createAsyncThunk(
  'avg-tone',
  async (data: EventsFilters) => {
    const {start_date, end_date, language, tone_start_range, tone_end_range, event_id} = data;
    const apiUrl = `http://localhost:8000/data/avg-tone/${start_date}/${end_date}/${language}`
    const response = await axios.get(apiUrl, {
        params: {
            tone_end_range: tone_end_range ? tone_end_range : undefined,
            tone_start_range: tone_start_range ? tone_start_range : undefined,
            event_id: event_id && event_id > -1 ? event_id : 0,
        }
    });
    const result = transformPlotData(response.data.data);

    return result;
  },
);

const transformPlotData = (plotData: any) => {
  const transformedPlotData: PlotData[] = [];
  plotData.map( (item: any) => {
    const transformedArticle: PlotData = {
      name: item.pub_month,
      value: item.avg_tone,
      date: item.pub_month
    };

    transformedPlotData.push(transformedArticle);
  })

  return transformedPlotData;
}

const avgEventsToneSlice = createSlice({
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
      state.avgTonePlotData = payload;
      state.loaded = true;
    });
    builder.addCase(fetchAvgArticlesTonePlot.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching Articles Data';
    });
  },
});

export default avgEventsToneSlice.reducer;
