import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import { EventsFilters } from '../../types/modules/eventsFilters.type';
import {
  EventypePlotdata,
  NoOfArticlesByEventTypePlotInitialState,
} from '../../types/modules/eventsPlots.type';

const noOfArticlesByEventTypePlotInitialData: NoOfArticlesByEventTypePlotInitialState =
  {
    status: 'idle',
    error: false,
    loaded: false,
    data: [],
  };

export const fetchNoOfArticlesPlotByEventType = createAsyncThunk(
  'no-of-articles-by-event-type',
  async (data: EventsFilters) => {
    const {
      start_date,
      end_date,
      language,
      tone_start_range,
      tone_end_range,
      event_id,
    } = data;
    const apiUrl = `${process.env.REACT_APP_ENDPOINT_URL}articles-per-event/${start_date}/${end_date}/${language}`;
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
  const transformedPlotData: any = [];
  plotData.map((item: any) => {
    let transformedArticle: EventypePlotdata = {
      date: item.publication_date,
    };
    delete item.publication_date;
    transformedArticle = {
      ...transformedArticle,
      ...item,
    };
    return transformedPlotData.push(transformedArticle);
  });

  return transformedPlotData;
};

const noOfEventsByEventTypeSlice = createSlice({
  name: 'no-of-articles-by-event-type',
  initialState: noOfArticlesByEventTypePlotInitialData,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchNoOfArticlesPlotByEventType.pending, state => {
      state.status = 'Loading';
      state.loaded = false;
      state.error = false;
    });
    builder.addCase(
      fetchNoOfArticlesPlotByEventType.fulfilled,
      (state, { payload }) => {
        state.status = 'Loaded';
        state.error = false;
        state.data = payload;
        state.loaded = true;
      },
    );
    builder.addCase(fetchNoOfArticlesPlotByEventType.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching No of Articles Data by event type';
    });
  },
});

export default noOfEventsByEventTypeSlice.reducer;
