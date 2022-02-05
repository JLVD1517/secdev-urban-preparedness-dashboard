import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axios } from '../../services/axios';
import { EventsInitialState } from '../../types/modules/eventsFilters.type';

const eventsInitialState: EventsInitialState = {
  status: 'idle',
  error: false,
  loaded: false,
  events: []
}

export const fetchEvents = createAsyncThunk(
  'fetch-events',
  async () => {
    const apiUrl = `${process.env.REACT_APP_ENDPOINT_URL}events`
    const response = await axios.get(apiUrl);    
    return response.data
  },
);

const eventsListSlice = createSlice({
  name: 'events-list',
  initialState: eventsInitialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchEvents.pending, state => {
      state.status = 'Loading';
      state.loaded = false;
      state.error = false;
    });
    builder.addCase(fetchEvents.fulfilled, (state, { payload }) => {
      state.status = 'Loaded';
      state.error = false;
      state.events = payload.data;
      state.loaded = true;
    });
    builder.addCase(fetchEvents.rejected, state => {
      state.error = true;
      state.loaded = false;
      state.status = 'Error Fetching Events List';
    });
  },
});

export default eventsListSlice.reducer;
