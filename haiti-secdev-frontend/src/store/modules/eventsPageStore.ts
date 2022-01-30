import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitialEventsComponentState, plotData } from '../../types';

const eventsComponentInitialState: InitialEventsComponentState = {
  stateDate: '01-12-2021',
  endDate:  '01-12-2022',
  noOfArticlesPlotData: [{
    value: 0,
    date: 'MAR-21',
    name: 'test'
  },
  {
    value: 10,
    date: 'APR-21',
    name: 'test'
  },
  {
    value: 20,
    date: 'JUN-21',
    name: 'test'
  }],
  avgTonePlotData: [{
    value: 20,
    date: 'MAR-21',
    name: 'test'
  },
  {
    value: 10,
    date: 'APR-21',
    name: 'test'
  },
  {
    value: 0,
    date: 'JUN-21',
    name: 'test'
  }],
};

const eventsComponentSlice = createSlice({
  name: 'eventsComponent',
  initialState: eventsComponentInitialState,
  reducers: {
    setEventsStartDate: (
      state,
      { payload }: PayloadAction<string>,
    ): void => {
      state.stateDate = payload;
    },
    setEventsEndDate: (
      state,
      { payload }: PayloadAction<string>,
    ): void => {
      state.endDate = payload;
    },
    setNoOfArticlesPlot: (
      state,
      { payload }: PayloadAction<[plotData]>,
    ): void => {
      state.noOfArticlesPlotData = payload
    },
    setAvgTonePlotData: (
      state,
      { payload }: PayloadAction<[plotData]>,
    ): void => {
      state.avgTonePlotData = payload
    }
  },
});


export const {
  setEventsStartDate,
  setEventsEndDate,
  setNoOfArticlesPlot,
  setAvgTonePlotData
} = eventsComponentSlice.actions;

export default eventsComponentSlice.reducer;
