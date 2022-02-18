import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import { EventsFilters } from '../../types/modules/eventsFilters.type';
import { NoOfArticlesPlotInitialState } from '../../types/modules/eventsPlots.type';
import { PlotData } from '../../types';

const noOfArticlesPlotInitialData: NoOfArticlesPlotInitialState = {
  status: 'idle',
  error: false,
  loaded: false,
  noOfArticlesPlotData: [],
};

export const fetchNoOfArticlesPlot = createAsyncThunk(
  'no-of-articles',
  async (data: EventsFilters) => {
    const {
      start_date,
      end_date,
      language,
      tone_start_range,
      tone_end_range,
      event_id,
    } = data;
    const apiUrl = `${process.env.REACT_APP_ENDPOINT_URL}data/articles-per-event/${start_date}/${end_date}/${language}`;
    const response = await axios.get(apiUrl, {
      params: {
        tone_end_range: tone_end_range ? tone_end_range : undefined,
        tone_start_range: tone_start_range ? tone_start_range : undefined,
        event_id: event_id && event_id > 0 ? event_id : undefined,
      },
    });
    const result = transformPlotData(response.data.data);

    return result;
  },
);

const transformPlotData = (plotData: any) => {
  const transformedPlotData: PlotData[] = [];
  plotData.map((item: any) => {
    const transformedArticle: PlotData = {
      name: item.event_type,
      value: item.no_of_articles,
      date: item.event_type,
    };

    return transformedPlotData.push(transformedArticle);
  });

  return transformedPlotData;
};

const noOfEventsSlice = createSlice({
  name: 'no-of-events',
  initialState: noOfArticlesPlotInitialData,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchNoOfArticlesPlot.pending, state => {
      state.status = 'Loading';
      state.loaded = false;
      state.error = false;
    });
    builder.addCase(fetchNoOfArticlesPlot.fulfilled, (state, { payload }) => {
      state.status = 'Loaded';
      state.error = false;
      state.noOfArticlesPlotData = payload;
      state.loaded = true;
    });
    builder.addCase(fetchNoOfArticlesPlot.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching No of Articles Data';
    });
  },
});

export default noOfEventsSlice.reducer;
